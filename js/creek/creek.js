"use strict";

import Audio from "./audio.js";
import Resources from "./resources.js";
import Utilities from "./utilities.js";
import Camera from "./camera.js";
import Physics from "./physics.js";

class Creek {
  constructor() {
    this._modules = {
      looper: new Looper(),
      physics: new Physics(),
      updater: new Updater(),
      drawer: new Drawer(),
      time: new Time(),
      context_manager: new ContextManager(),
      camera: new Camera(),
      data: new Data(),
      controls: new Controls(),
      entities: new Entities(),
      audio: new Audio(),
      resources: new Resources(),
      utilities: new Utilities(),
    };
    this.reservedWords = ['reservedWords', 'run', 'init', '_modules'];

    this.proxy = new Proxy(this, {
      get: (target, property) => {
        if (target._modules[property]) {
          return target._modules[property]
        }
        return target[property];
      },
      set: (target, property, value) => {
        if (this.reservedWords.find(property)) {
          console.error(`cannot create module using reserved name ${property}`);
        }
        if (this._modules[property]) {
          console.error(`cannot create module using existing module name ${property}`);
        }

        target[property] = value;
        return true;
      }
    });
    return this.proxy;
  }

  init = external_modules => {
    const creek_modules = [
      ...Object.values(this._modules),
      ...Object.values(external_modules)
    ];

    for (const creek_module of creek_modules) {
      if (creek_module.init && !creek_module.has_done_init) {
        creek_module.init(this.proxy);
        creek_module.has_done_init = true;
      }
    }
  };

  run = () => {
    this._modules.looper.loop(this.proxy);
  };
}

class Time {
  constructor() {
    this.ticks = 0;
  }
  set_ticks = () => this.ticks = performance.now();
  get_ticks = () => this.ticks;
}

class Controls {
  constructor() {
    this.keys = {};
    this.mouse = {};
    this.events = {
      pointermove: event => this.set_coords(event.clientX, event.clientY),
      touchmove: event => {
        const touches = event.changedTouches;
        for (let i = 0; i < touches.length; i++) {
          if (touches[i] && touches[i].pageX && touches[i].pageY) {
            this.set_coords(touches[i].pageX, touches[i].pageY);
          }
        }
        return this.set_store(this.mouse, 1, true);
      },
      touchcancel: event => this.set_store(this.mouse, 1, false),
      pointercancel: event => this.set_store(this.mouse, event.which, false),
      keydown: event => this.set_store(this.keys, event.code, true),
      keyup: event => this.set_store(this.keys, event.code, false),
      pointerdown: event => {
        this.set_coords(event.clientX, event.clientY);
        return this.set_store(this.mouse, event.which, true);
      },
      touchstart: event => {
        this.set_coords(event.clientX, event.clientY);
        return this.set_store(this.mouse, 1, true);
      },
      pointerup: event => this.set_store(this.mouse, event.which, false),
      touchend: event => this.set_store(this.mouse, 1, false)
    };
  }

  init = creek => {
    this.creek = creek;

    for (const event_name in this.events) {
      document.addEventListener(event_name, this.events[event_name]);
    }
  };

  reset = value => {
    if (!value) {
      this.keys = {};
      this.mouse = {};
    } else {
      this.keys = value.keys;
      this.mouse = value.mouse;
    }
  };

  set_store = (store, id, pressed) => {
    store[id] = {
      pressed,
      time: this.creek.time.get_ticks()
    };

    if (navigator.maxTouchPoints !== 0) {
      return false;
    }
    return true;
  };

  set_coords = (x, y) => {
    this.mouse.x = x;
    this.mouse.y = y;
    return false;
  }

  get_key = id => ({
    id,
    pressed: this.keys[id] ? this.keys[id].pressed : null,
    time: this.keys[id] ? this.keys[id].time : null
  });

  get_mouse = (id = 1) => ({
    id,
    pressed: this.mouse[id] ? this.mouse[id].pressed : null,
    time: this.mouse[id] ? this.mouse[id].time : null,
    x: this.mouse.x,
    y: this.mouse.y
  });

  check_key = id => this.get_key(id).pressed;
  check_mouse = id => this.get_mouse(id).pressed;
}

class Updater {
  init = creek => {
    this.creek = creek;
    this.controls = creek.controls;
    this.data = creek.data;
    this.entities = creek.entities;
  };

  update = () => {
    for (const element of this.entities.list) {
      if (
        this.controls.check_key("ShiftLeft") &&
        this.controls.check_key("Backquote")
      ) {
        debugger;
      }
      if (this.data.break_update_loop === true) {
        console.log("update loop broken out of");
        break;
      }

      element.update(this.creek);
    }
  };
}

class ContextManager {
  set_max_size = () => {
    const canvas = document.getElementById("canvas");
    this.canvas = canvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (navigator.maxTouchPoints !== 0) {
      canvas.height = window.innerHeight + 80;
      window.scrollTo(0, 1);
    }
    this.context = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
  }

  prep = () => {
    this.set_max_size();
  }

  init = creek => {
    this.creek = creek;
  };
}

class Drawer {
  constructor() {
    this.list = null;
  }

  init = creek => {
    this.context_manager = creek.context_manager;
    this.physics = creek.physics;
    this.camera = creek.camera;
    this.entities = creek.entities;
    window.addEventListener("resize", event => this.prep());
  }

  // prep for first render
  prep = () => {
    this.context_manager.prep();
    this.camera.prep();
  };

  clearScreen = () => {
    const context_manager = this.context_manager;
    const storedTransform = context_manager.context.getTransform();
    context_manager.context.setTransform(1,0,0,1,0,0);
    context_manager.context.clearRect(
      0,
      0,
      context_manager.width,
      context_manager.height
    );
    context_manager.context.setTransform(storedTransform);
  };

  draw(interpolation) {
    const offset = this.camera.offset;
    const centering_x = parseInt((this.context_manager.width-this.camera.rect.x_size)/2);
    const centering_y = parseInt((this.context_manager.height-this.camera.rect.y_size)/2);

    this.clearScreen();
    this.context_manager.context.setTransform(1,0,0,1, centering_x-offset.x, centering_y-offset.y);
    for (const element of this.entities.list) {
      if (this.physics.collide(this.camera, element)) {
        element.draw(this.context_manager.context, interpolation);
      }
    }
    // for camera debugging:
    // this.camera.draw(this.context_manager.context, interpolation);
  }
}

class Entities {
  init = creek => {
    this.data = creek.data;
  };

  get list () {
    return this.data.entity_list;
  }
}

class Data {
  constructor() {
    this.data = {};
    return new Proxy(this, {
      get: (target, property) => {
        return this.data[property];
      },
      set: (target, property, value) => {
        this.data[property] = value;
        return true;
      }
    });
  }
}

class Looper {
  constructor() {}

  init = creek => {
    this.data = creek.data;
    this.time = creek.time;
    this.updater = creek.updater;
    this.drawer = creek.drawer;
  };

  loop = creek => {
    const max_frame_skip = 5;
    const ticks_per_second = 25;
    const skip_ticks = 1000 / ticks_per_second;

    let next_game_tick = this.time.get_ticks();
    let running = true;
    let loops = 0;
    let interpolation = 0;

    this.drawer.prep();
    this.data.game_running = running;
    this.time.set_ticks();

    const inner_loop = () => {
      loops = 0;

      while (this.time.set_ticks() > next_game_tick && loops < max_frame_skip) {
        this.updater.update();
        next_game_tick += skip_ticks;
        loops += 1;
      }

      if (this.data.break_update_loop === true) {
        this.data.break_update_loop = false;
      } else {
        interpolation =
          (this.time.get_ticks() + skip_ticks - next_game_tick) / skip_ticks;
        this.drawer.draw(interpolation);
      }

      if (this.data.game_running) {
        requestAnimationFrame(inner_loop);
      } else {
        console.log("graceful shutdown complete.");
      }
    };

    requestAnimationFrame(inner_loop);
  };
}

export default Creek;
