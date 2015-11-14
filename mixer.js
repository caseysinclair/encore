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
  var bufferGlobal;

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

          return soundManager[soundManager.length - 1];

        });
      };

      req.send();
    },

    // connect the channel audio source to master output (speakers)
    _connectChannel: function (channel, buffer) {
      channel.source = audioBuffer;
      channel.source.buffer = buffer;
      channel.source.connect(channel.destination);
      channel.source.start(0);
    }
  };

  /** Encore Sound */
  var Sound = Encore.Sound = function (sample) {
    var sampleLoaded = false;
    this.sample = sample;
    this.sound = '';
    this.channel = null;
    this.tempBuffer = '';
    this.initialise.apply(this);
  };

  _.extend(Sound.prototype, {
    initialise: function () {
      this.channel = Encore._addChannel();
      Encore._initialiseMixer(this.channel);
      Encore._loadChannel(this.channel, this.sample);
    },

    play: function () {
      var sound = this.sound = context.createBufferSource();
      sound.buffer = soundManager[0];

      this.sound.connect(context.destination);
      this.sound.start();
    },

    stop: function () {
      this.sound.stop();
    },

    loop: function (loop) {
      loop === true ? this.loop = true : false;
    }
  });

  var root = window;
  root.Encore = Encore

})();