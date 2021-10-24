"use strict";

class Camera {
  init = creek => {
    console.log("CameraManager init.");
    this.creek = creek;
    this.utils = creek.utilities;
    this.data = creek.data;

    this.camera_config = {
      x: 0,
      y: 0,
      //width: 1344,
      //height: 768,
      width: 0,
      height: 0,
      left_margin: 60,
      right_margin: 60,
      top_margin: 60,
      bottom_margin: 60,
      fullscreen: true,
    };
    this.width = this.camera_config.width;
    this.height = this.camera_config.height;

    this.fullscreen = this.camera_config.fullscreen || false;
    this.context_manager = this.creek.context_manager;

    this.camera = {
      inner_x: this.camera_config.x-this.width/4,
      inner_y: this.camera_config.y-this.height/4,
      inner_width: this.width / 2,
      inner_height: this.height / 2,
      x: this.camera_config.x,
      y: this.camera_config.y,
      width: this.width,
      height: this.height,
      x_size: this.width,
      y_size: this.height,
      top_margin: this.camera_config.top_margin,
      bottom_margin: this.camera_config.bottom_margin,
      left_margin: this.camera_config.left_margin,
      right_margin: this.camera_config.right_margin,
    };
  };

  prep = () => {
    if (this.fullscreen) {
      this.width = this.context_manager.width;
      this.height = this.context_manager.height;
    }
    this.resize();
  };

  get offset () {
    return {
      x: parseInt(this.camera.x),
      y: parseInt(this.camera.y),
    };
  };

  get rect () {
    return {
      x: parseInt(this.camera.x - this.camera.left_margin),
      y: parseInt(this.camera.y - this.camera.top_margin),
      x_size: parseInt(this.camera.width + this.camera.left_margin + this.camera.right_margin),
      y_size: parseInt(this.camera.height + this.camera.top_margin + this.camera.bottom_margin),
    };
  }

  draw = (context, interpolation) => {
    const r = this.rect;
    context.strokeStyle = "blue";
    context.strokeRect(r.x, r.y, r.x_size, r.y_size);
  };

  center = (center_x, center_y) => {
    let camera = this.camera;
    let new_camera_x = camera.x;
    let new_camera_y = camera.y;
    camera.desired_center_x = center_x;
    camera.desired_center_y = center_y;

    if (center_x > camera.inner_x + camera.inner_width) {
      new_camera_x += (center_x - (camera.inner_x + camera.inner_width));
    } else if (center_x < camera.inner_x) {
      new_camera_x += (center_x - camera.inner_x);
    }

    if (center_y > camera.inner_y + camera.inner_height) {
      new_camera_y += (center_y - (camera.inner_y + camera.inner_height));
    } else if (center_y < camera.inner_y) {
      new_camera_y += (center_y - camera.inner_y);
    }

    this.move(new_camera_x, new_camera_y);
  };

  move = (x, y) => {
    const camera = this.camera;

    // this should be in the _game_'s logic, not the engine's
    const map = this.data.maps && this.data.maps.current_map
      ? this.data.maps.current_map
      : {
          pixel_width: camera.width,
          pixel_height: camera.height
        };

    x = this.utils.clamp(x, 0, map.pixel_width-(camera.width+camera.left_margin));
    y = this.utils.clamp(y, 0, map.pixel_height-(camera.height+camera.top_margin));

    camera.x = x;
    camera.y = y;
    camera.inner_x = camera.x + camera.width / 4;
    camera.inner_y = camera.y + camera.height / 4;
  };

  resize = (width, height) => {
    const camera = this.camera;
    const context_manager = this.context_manager;
    if (!width && !height) {
      width = context_manager.width;
      height = context_manager.height;
    }
    width = this.utils.clamp(width, 0, context_manager.width);
    height = this.utils.clamp(height, 0, context_manager.height);

    camera.width = width;
    camera.height = height;
    camera.x_size = width;
    camera.y_size = height;
    camera.inner_width = width / 2;
    camera.inner_height = height / 2;

    if (camera.desired_center_x && camera.desired_center_y) {
      this.center(camera.desired_center_x, camera.desired_center_y);
    } else {
      this.move(camera.x, camera.y);
    }
  };
}

export default Camera;