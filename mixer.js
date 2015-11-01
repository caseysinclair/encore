/**
 * ENCORE is a JavaScript helper library for the Web Audio API
 * v.0.1
 *
 * Copyright (c) 2015 Casey Sinclair
 * Released under the MIT license
 */

(function () {

  var Encore = {};

  // Import underscore
  var _ = require('underscore');
  var dev = require('./utils');

  // Initlize WebAudio API
  var AudioContext = window.AudioContext || window.webkitAudioContext,
    context = new AudioContext();

  // Channels object
  var channels = [];
  var soundManger = [];

  // Effect Units
  var
    volume = context.createGain(),
    delayUnit = context.createDelay(),
    reverbUnit = context.createConvolver(),
    panner = context.createStereoPanner(),
    eq = context.createBiquadFilter();

  // Audio Units
  var
    audioBuffer = context.createBufferSource();



  // --- Encore Mixer ---

  Encore.addChannelStrip = function () {
    var ch = context;
    ch.mixer = {};
    ch.mixer.volume = volume;
    ch.mixer.panner = panner;
    ch.mixer.eq = eq;

    channels.push(ch); // push object

    // create reference to this channel strip
    ch.reference = {
      channelIndex: _.indexOf(channels, ch), // important reference to self.
      channelId: _.uniqueId('ch_') // attach id
    };

    // push reference
    channels.push(ch.reference);

    dev.info(ch);
    return ch;
  };

  /** Set the buffer to the channel source.buffer
   *
   * @param {object} channel
   * @param {string} buffer
   */
  Encore.connectAudioSource = function (channel, buffer) {
    channel.source = audioBuffer;
    channel.source.buffer = buffer;
    channel.source.connect(channel.destination);

    Encore.connectAudioUnits(channel);
  };

  /**
   * Connect audio nodes to master out
   * @param {object} channel
   */
  Encore.connectAudioUnits = function (channel) {
    var source = channel.source;
    var mixer = channel.mixer;
    if (channel && source) {
      _.each(mixer, function (v) {
        return source.connect(v);
      })
    }

    Encore.playChannel(channel, 0);
  };

  /**
   * Decode audio to channel buffer
   * TODO: Break this out using q promise
   * @param {object} channel
   * @param {string} sourceFile
   */
  Encore.loadSound = function (channel, sourceFile) {
    var req = new XMLHttpRequest();
    req.open('GET', sourceFile, true);
    req.responseType = 'arraybuffer';

    req.onload = function () {
      context.decodeAudioData(req.response, function (buffer) {
        Encore.connectAudioSource(channel, buffer)
      });
    };
    req.send();
  };

  /**
   * Hit play on a channel
   * @param channel
   * @param playPosition
   * @param loop
   */
  Encore.playChannel = function (channel, playPosition, loop) {
    var source = channel.source;

    if (loop && loop === true) {
      source.loop = true;
    }

    source.start(playPosition)
  };



  // create volume (slider)
  Encore.patchVolume = function (channel) {
    return channel.volume = volume;
  };

  // create stereo pan control
  Encore.patchPanner = function (channel) {
    return channel.panner = panner;
  };

  Encore.patchEq = function (channel) {
    return channel.eq = eq;
  };

  // create effects unit (delay)
  Encore.patchDelay = function (channel) {
    return channel.delay = delayUnit;
  };

  // create effects unit (reverb)
  Encore.patchReverb = function (channel) {
    return channel.reverb = reverbUnit
  };

  // EXAMPLE
  var kick = Encore.addChannelStrip();            // Initialize new channel
  Encore.loadSound(kick, 'samples/kick3.wav');   // Load in audio sample



})();

