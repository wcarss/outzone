"use strict";

import Creek from "./creek/creek.js";
import Palettes from "./palettes.js";

class Thinger {
  constructor() {
    this.state = "up";
    this.styles = [];
  }

  init(creek) {
    this.creek = creek;
    creek.utilities.setup_throttle("player_move", 20);
    creek.utilities.setup_throttle("autoplay", 200);
    this.palette = creek.utilities.random_choice(Palettes);
    this.max_x = creek.camera.rect.x_size;
    this.max_y = creek.camera.rect.y_size;
    this.x_size = this.max_x / 20;
    this.y_size = this.max_y / 20;
    this.x = Math.max(this.max_x/2+this.x_size/2, 300);
    this.y = Math.max(this.max_y/2+this.y_size/2, 300);
    this.x_speed = 7;
    this.y_speed = 7;
    this.autoPlay = false;
  }

  draw(context, interpolation) {
    for (const [index, style] of Object.entries(this.styles)) {
      context.fillStyle = style;
      context.beginPath();
      context.moveTo(this.x, this.y);
      context.arc(
        this.x, this.y, this.x_size+(this.styles.length*18)-index*18, 0, Math.PI*2);
      context.fill();
    }
  }

  update(creek) {
    const controls = creek.controls;
    const utilities = creek.utilities;

    // recalibrate on resizes
    this.max_x = creek.camera.rect.x_size;
    this.max_y = creek.camera.rect.y_size;
    this.x_size = this.max_x / 20;
    this.y_size = this.max_y / 20;

    this.x += this.x_speed;
    this.y += this.y_speed;
    if (this.x > this.max_x-(this.x_size+30*3) || this.x < (this.x_size+30*3)) {
      this.x_speed *= -1;
    }
    if (this.y > this.max_y-(this.y_size+30*3) || this.y < (this.y_size+30*3)) {
      this.y_speed *= -1;
    }

    if (
      !utilities.use_throttle("player_move")
    ) {
      return;
    }

    this.lastState = this.state;
    let keyHit = false;

    if (controls.check_key("Space")) {
      this.palette = utilities.random_choice(Palettes);
    }

    if (this.autoPlay) {
      if (Math.random() > 0.81) {
        keyHit = true;
      }
      if (Math.random() > 0.92) {
        this.state = utilities.random_choice(["up", "down", "right", "left"]);
      }
    } else {
      if (controls.check_key("ArrowUp")) {
        this.state = "up";
        keyHit = true;
      } else if (controls.check_key("ArrowDown")) {
        this.state = "down";
        keyHit = true;
      }
      if (controls.check_key("ArrowLeft")) {
        this.state = "left";
        keyHit = true;
      } else if (controls.check_key("ArrowRight")) {
        this.state = "right";
        keyHit = true;
      }
    }

    if (utilities.use_throttle("autoplay") && controls.check_key("KeyZ")) {
      this.autoPlay = !this.autoPlay;
      console.log('autoplay:', this.autoPlay)
    }

    const palette = this.palette;
    const fillStyle = {
      up: palette[0],
      down: palette[1%palette.length],
      left: palette[2%palette.length],
      right: palette[3%palette.length],
    }[this.state];

    //if (this.state !== this.lastState) {
    if (keyHit && this.state === this.lastState) {
      this.styles.push(utilities.random_choice(palette));
    } else {
      this.styles.push(fillStyle);      
    }
    if (this.styles.length > 114) {
      this.styles.shift();
    }
  }

  get rect() {
    return {
      x: 0,
      y: 0,
      x_size: this.x_size,
      y_size: this.y_size,
    };
  }
}

window.onload = async () => {
  const creek = new Creek();
  const thinger = new Thinger();

  creek.init([thinger]);
  creek.run();
  creek.data.thinger = thinger;
  creek.data.entity_list = [thinger];
};
