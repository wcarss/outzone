"use strict";

class Audio {
  constructor() {
    this.creek = null;
    this.clips = null;
    this.default_volume = 1;
    // TODO: maybe support the below -- no such thing as a config object in new creek at this point
    // this.default_volume = creek.get('config')['default_volume'] || 1;

    this.resource_manager = null;
    this.currently_paused = [];
    this.all_muted = false;
  }

  init = creek => {
    console.log("AudioManager init.");
    this.creek = creek;
    // this.resource_manager = creek.get('resource');
    this.load_clips(creek.resources.get_sounds());
  };

  load_clips = loaded_clips => {
    if (this.clips === null) {
      this.clips = {};
    }

    for (const clip_id in loaded_clips) {
      const loaded_clip = loaded_clips[clip_id];
      console.log("loading clip " + loaded_clip.id);
      const clip = new Clip(loaded_clip.id, loaded_clip.url, loaded_clip.element);

      if (this.clips && this.clips[clip.id]) {
        console.log("attempted to load multiple identical clip ids");
        debugger;
      }

      this.clips[clip.id] = clip;
    }
  };

  get_clip = clip_id => {
    /* Pulling the below out. Not sure if I want creek to work this way any more.
     *  let sounds = null;
     *
     *  if (clips === null) {
     *    sounds = this.resource_manager.get_resources()['sound'];
     *    if (!sounds || empty_dict(sounds)) {
     *      console.log("clips haven't loaded yet!");
     *      return null;
     *    } else {
     *      this.load_clips(sounds);
     *    }
     *  }
     *
     */
    const clip = this.clips[clip_id];

    if (!clip) {
      console.log(
        "attempting to get clip: " + clip_id + " that wasn't found in clips"
      );
    }

    return clip;
  };

  play = clip_id => this.get_clip(clip_id).play();
  pause = clip_id => this.get_clip(clip_id).pause();
  playing = clip_id => this.get_clip(clip_id).playing();
  paused = clip_id => this.get_clip(clip_id).paused();
  stop = clip_id => this.get_clip(clip_id).stop();

  volume = (clip_id, level) => this.get_clip(clip_id).volume(level);
  get_volume = clip_id => this.get_clip(clip_id).get_volume();

  set_time = (clip_id, time) => this.get_clip(clip_id).set_time(time);
  get_time = clip_id => this.get_clip(clip_id).get_time();

  mute = clip_id => this.get_clip(clip_id).mute();
  unmute = clip_id => this.get_clip(clip_id).unmute();
  muted = clip_id => this.get_clip(clip_id).muted();

  loop = (clip_id, looping_bool) => this.get_clip(clip_id).loop(looping_bool);
  looping = clip_id => this.get_clip(clip_id).looping();
  duration = clip_id => this.get_clip(clip_id).duration();

  pause_all = () => {
    for (const clip of Object.values(this.clips)) {
      if (clip.playing()) {
        clip.pause();
        this.currently_paused.push(clip.id);
      }
    }
  };
  unpause_all = () => {
    for (const clip_id of this.currently_paused) {
      this.get_clip(clip_id).play();
    }
    this.currently_paused = [];
  };
  stop_all = () => Object.values(this.clips).map(clip => clip.stop(level));

  volume_all = level => Object.values(this.clips).map(clip => clip.volume(level));
  mute_all = level => {
    Object.values(this.clips).map(clip => clip.mute());
    this.all_muted = true;
  };
  unmute_all = level => {
    Object.values(this.clips).map(clip => clip.unmute());
    this.all_muted = false;
  };
  are_all_muted = () => this.all_muted;
}

class Clip {
  constructor(id, url, element) {
    this.id = id;
    this.url = url;
    this.element = element;
  }

  play = () => this.element.play();
  pause = () => this.element.pause();
  stop = () => {
    this.element.currentTime = 0;
    this.element.pause();
  };
  playing = () => !this.element.paused;
  paused = () => this.element.paused;

  volume = level => this.element.volume = level;
  get_volume = () => this.element.volume;

  get_time = () => this.element.currentTime;
  set_time = time => this.element.currentTime = time;
  duration = () => this.element.duration;

  mute = () => this.element.muted = true;
  unmute = () => this.element.muted = false;
  muted = () => this.element.muted;

  loop = looping_bool => this.element.loop = looping_bool;
  looping = () => this.element.looping;
}

export default Audio;
