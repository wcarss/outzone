"use strict";

class Utilities {
  constructor() {
    this.THROTTLE_KEY = "_util_throttles";
  }

  init = creek => {
    this.creek = creek;
    this.data = creek.data;
    this.time = creek.time;
    this.data[this.THROTTLE_KEY] = {};
  };

  get_key = (a, b) => `${a}_${b}`;
  random_int = n => parseInt(Math.floor(Math.random() * n));
  random_choice = arr => arr[this.random_int(arr.length)];

  get_throttle = id => this.creek.data[this.THROTTLE_KEY][id];
  clear_throttle = id => delete this.creek.data[this.THROTTLE_KEY][id];
  setup_throttle = (id, limit = 0, func = null, args = null, timestamp = 0) => {
    const throttles = this.creek.data[this.THROTTLE_KEY];

    if (throttles[id]) {
      console.warn(`setting a throttle '${id}' that already exists`);
      debugger;
    }

    throttles[id] = {
      id,
      timestamp,
      limit,
      func,
      args,
      invoke_count: 0,
      run_count: 0,
    };
  };
  use_throttle = (id, func, args, limit, timestamp) => {
    const throttle = this.get_throttle(id);
    let return_value = null;

    if (!throttle) {
      console.warn(`tried to use a throttle '${id}' that does not exist`);
      debugger;
    }

    limit = limit || throttle.limit;
    timestamp = timestamp || throttle.timestamp;

    throttle.invoke_count += 1;
    if (this.time.ticks - timestamp >= limit) {
      func = func || throttle.func;
      args = args || throttle.args;

      if (func) {
        return_value = func(...args);
      } else {
        return_value = true;
      }

      throttle.timestamp = this.time.ticks;
      throttle.run_count += 1;
    }
    // for debugging: console.log(`runs: ${throttle.run_count}, time: ${this.time.ticks}, throttle timestamp: ${timestamp}, limit: ${limit}`);

    return return_value;
  };

  clamp = (val, low, high, epsilon, debug) => {
    epsilon = epsilon || 0.001;

    if (val <= low - epsilon) {
      if (debug) {
        console.log(val + "clamped up to " + low);
      }
      val = low;
    }

    if (val >= high + epsilon) {
      if (debug) {
        console.log(val + "clamped down to " + high);
      }
      val = high;
    }

    return val;
  };
}

export default Utilities;
