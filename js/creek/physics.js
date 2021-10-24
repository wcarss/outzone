"use strict";

class Physics {
  init = creek => {
    this.creek = creek;
    console.log("PhysicsManager init.");
  };

  to_rect = entity => ({
    left: entity.x,
    right: entity.x + entity.x_size,
    top: entity.y,
    bottom: entity.y + entity.y_size,
    // no longer used
    //width: entity.x_size,
    //height: entity.y_size,
    //mid_x: entity.x + entity.x_size / 2,
    //mid_y: entity.y + entity.y_size / 2,
    //'collide_distance': Math.max(entity.x_size / 2, entity.y_size / 2),
  });

  distance = (rect_one, rect_two, debug) => {
    const mid_x1 = entity_one.x + entity_one.x_size / 2;
    const mid_x2 = entity_two.x + entity_two.x_size / 2;
    const mid_y1 = entity_one.y + entity_one.y_size / 2;
    const mid_y2 = entity_two.y + entity_two.y_size / 2;
    const x_distance = Math.abs(mid_x1 - mid_x2);
    const y_distance = Math.abs(mid_y1 - mid_y2);
    const hypotenuse = Math.sqrt(
      x_distance * x_distance + y_distance * y_distance
    );
    return hypotenuse;
  };

  collide = (entity_one, entity_two, debug) => {
    if (entity_one.rect === undefined || entity_two.rect === undefined) debugger;
    //const a = this.to_rect(entity_one);
    //const b = this.to_rect(entity_two);
    const a = this.to_rect(entity_one.rect);
    const b = this.to_rect(entity_two.rect)                                     ;
    const d1x = a.left - b.right;
    const d1y = a.top - b.bottom;
    const d2x = b.left - a.right;
    const d2y = b.top - a.bottom;
    let ret = null;

    if (debug) {
      console.log("entity one, a: " + JSON.stringify(a));
      console.log("entity two, b: " + JSON.stringify(b));
      console.log("d1x, d2x, d1y, d2y: " + d1x + ", " + d2x + ", " + d1y + ", " + d2y);
    }

    if (d1x > 0 || d1y > 0 || d2x > 0 || d2y > 0) {
      ret = false;
    } else {
      ret = true;
    }

    if (debug) {
      console.log("aabb_collide returning " + ret);
    }

    return ret;
  };
}

export default Physics;