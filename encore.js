/**
 * ENCORE is a JavaScript helper library for the Web Audio API
 * v.0.1
 *
 * Copyright (c) 2015 Casey Sinclair
 * Released under the MIT license
 */

// Imports
var _ = require('underscore');
var dev = require('./utils');

'use strict';

(function () {

  // Initlize WebAudio API
  var AudioContext = window.AudioContext || window.webkitAudioContext,
    context = new AudioContext();

  // Channels object
  var channels = [];
  var soundManager = [];

  // Effect Units
  var volume = context.createGain(),
    delayUnit = context.createDelay(),
    reverbUnit = context.createConvolver(),
    panner = context.createStereoPanner(),
    eq = context.createBiquadFilter();

  // Audio Units
  var audioBuffer = context.createBufferSource();

  var Encore = {
    // creates new audio channel
    _addChannel: function () {
      var ch = context;
      ch.mixer = {volume: volume, panner: panner, eq: eq};
      channels.push(ch); // push object

      return ch;
    },

    // connect output of each mixer components (volume, pan, eq)
    _initialiseMixer: function (channel) {
      var source = channel.source;
      var mixer = channel.mixer;

      if (channel && source) {
        _.each(mixer, function (v) {
          return source.connect(v);
        })
      }
    },

    _getMixer: function (channel) {
      return channel.mixer;
    },

    // load audio sample into the channels source buffer
    _loadChannel: function (channel, sourceFile) {
      var req = new XMLHttpRequest();
      req.open('GET', sourceFile, true);
      req.responseType = 'arraybuffer';

      req.onload = function () {
        context.decodeAudioData(req.response, function (buffer) {
          var uid = _.uniqueId('soundInx');
          buffer.meta = {id: uid, location: sourceFile};

          soundManager.push(buffer);

          return Sound.bufferIndex = soundManager.length - 1;

        });
      };

      req.send();
    },

    _getBufferDetails: function(indexOfBuffer) {
      var audio = soundManager[indexOfBuffer];

      return {
        duration: audio.duration,
        length: audio.length,
        location: audio.meta.location,
        sampleRate: audio.meta.sampleRate
      };
    },

    // connect the channel audio source to master output (speakers)
    _connectChannel: function (channel, buffer) {
      channel.source = audioBuffer;
      channel.source.buffer = buffer;
      channel.source.connect(channel.destination);
      channel.source.start(0);
    }
  };

  /**
   * Encore.Sound extends prototype methods onto sound source.
   * e.g var kick = new Encore.Sound(./path/to/sound)
   *
   * @type {Function}
   */
  var Sound = Encore.Sound = function (sample) {
    this.sample = sample;
    this.sound = '';
    this.channel = null;
    this.bufferIndex = '';
    this.initialise.apply(this);
  };

  _.extend(Sound.prototype, {

    /**
     * Initialise mixer channel and load the sample
     * onto the new channel
     *
     */
    initialise: function () {
      this.channel = Encore._addChannel();
      Encore._initialiseMixer(this.channel);
      Encore._loadChannel(this.channel, this.sample);
    },


    /** Play buffer source **/
    play: function () {
      var sound = this.sound = context.createBufferSource();
      sound.buffer = soundManager[Sound.bufferIndex];

      this.sound.connect(context.destination);
      this.sound.start();
    },

    /** Stop buffer source **/
    stop: function () {
      this.sound.stop();
    },


    /**
     * Set volume on source
     *
     * @param {init} unit 0 = mute, 10 = loudest
     */
    volume: function (unit) {
      var mixer = Encore._getMixer(this.channel);
      mixer.volume.gain.value = unit;
    },

    /**
     * Stereo pan sample
     *
     * @param {init} unit -10 = far left, 0 = center, 10 = far right
     */
    pan: function (unit) {
      var mixer = Encore._getMixer(this.channel);
      mixer.panner.pan.value = unit;
    },


    // TODO: Human readable time 0.7s, 3.23m
    duration: function () {
      var time = Encore._getBufferDetails(this.bufferIndex).duration;

      return time +'s';
    }
  });

  var root = window;
  root.Encore = Encore

})();