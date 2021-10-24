"use strict";

class Resources {
  constructor() {
    this.creek = null;
    this.has_done_init = false;
    this.image_base_url = "";
    this.resources = {
      image: {},
      sound: {},
    };
  }

  init = async (creek, parsed_resources) => {
    console.log("ResourceManager init.");
    this.creek = creek;

    // let parsedresources = manager.get('config').get_resources(),
    const promises = [];
    for (const resource of parsed_resources) {
      const loader = {
        image: this.load_image,
        sound: this.load_sound,
      }[resource.type];

      if (!loader) {
        console.log("tried to load unknown resource type: " + resource.type);
        continue;
      }

      promises.push(loader(resource));
    }

    // create 'Click to Play!' pre-emption box to allow sound to load
    if (parsed_resources.some(resource => resource.type === "sound")) {
      this.create_sound_trigger();
    }

    try {
      const loaded = await Promise.all(promises);
      for (const resource of loaded) {
        this.resources[resource.type][resource.id] = resource;
      }
    } catch (e) {
      console.log("trouble loading resources: ", e);
    }
    this.has_done_init = true;

    console.log("resources after load are: ", this.resources);
    this.post_resource_load();
  };

  get_image = name => this.resources["image"][name];
  get_sound = name => this.resources["sound"][name];
  get_images = () => this.resources["image"];
  get_sounds = () => this.resources["sound"];
  get_resources = () => this.resources;

  load_image = resource => {
    const load = (resolve, resource, image) => () => {
      console.log("image " + resource.url + " loaded.");
      const local_canvas = document.createElement("canvas");
      let local_context = null;

      const dest_x = resource.x || 0;
      const dest_y = resource.y || 0;
      const dest_width = resource.width || resource.source_width;
      const dest_height = resource.height || resource.source_height;

      local_canvas.width = dest_width;
      local_canvas.height = dest_height;
      local_context = local_canvas.getContext("2d");

      local_context.drawImage(
        image,
        resource.source_x,
        resource.source_y,
        resource.source_width,
        resource.source_height,
        dest_x,
        dest_y,
        dest_width,
        dest_height
      );

      resolve({
        type: resource.type,
        id: resource.id,
        url: resource.url,
        img: local_canvas,
        original_source_x: resource.source_x,
        original_source_y: resource.source_y,
        original_source_width: resource.source_width,
        original_source_height: resource.source_height,
        source_x: dest_x,
        source_y: dest_y,
        source_width: dest_width,
        source_height: dest_height
      });
    };

    const error = (reject, resource, image) => () => {
      console.log("image " + resource.url + " failed to load.");
      reject();
    };

    const image = new Image();
    const promise = new Promise((resolve, reject) => {
      image.addEventListener("load", load(resolve, resource, image), false);
      image.addEventListener("error", error(reject, resource, image), false);
    });
    // setting the src attribute triggers the resource to begin loading
    image.src = resource.url;

    return promise;
  };

  load_sound = resource => {
    const load = (resolve, resource, sound) => () => {
      console.log("sound " + resource.url + " began loading.");
      resolve({
        type: resource.type,
        id: resource.id,
        url: resource.url,
        element: sound
      });
    };
    const error = (reject, resource, sound) => () => {
      console.log("sound " + resource.url + " failed to load.");
      reject();
    };

    const sound = document.createElement("audio");
    const promise = new Promise((resolve, reject) => {
      sound.addEventListener("loadstart", load(resolve, resource, sound), false);
      sound.addEventListener("error", error(resolve, resource, sound), false);
    });

    // preset some attributes of the element from config
    sound.preload = "none";
    sound.loop = resource.looping;
    sound.muted = resource.muted;
    sound.volume = resource.volume;

    // setting the src attribute triggers the resource to begin loading
    sound.src = resource.url;
    return promise;
  };

  add_image = image => {
    if (!image || !image.id || !image.img) {
      console.log("no image or image without id/img in add_image");
      console.log("image was:", image);
      return;
    }
    if (this.resources["image"][image.id]) {
      console.log("overwriting image " + image.id + " in add_image.");
    }
    this.resources["image"][image.id] = image;
  }

  post_resource_load() {
    // not implemented in new-creeek yet
    //    creek.get('game_state').post_resource_load(manager);
  }

  // require a click before playing any sounds, due to strict sound/interaction policies
  create_sound_trigger = () => {
    const sound_trigger = document.createElement("div");

    sound_trigger.id = "sound_trigger";
    sound_trigger.setAttribute(
      "style",
      "background: black; color: white; font-size: 3em; position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 100;"
    );
    sound_trigger.innerHTML =
      "<div style='width: 20%; margin: 20% auto;'>Click to play!</div>";

    const listener = () => {
      this.creek.audio.play("cave_hopping");
      sound_trigger.removeEventListener("click", listener);
      sound_trigger.parentNode.removeChild(sound_trigger);
    };
    sound_trigger.addEventListener("click", listener);
    document.body.appendChild(sound_trigger);
  };
}

export default Resources;
