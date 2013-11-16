// Tip: If you have access to soundcard settings, adjust input gain so that 
// microphone input averages between 50% and 75% metering on soundcard.
// Good rule of thumb for analyser is that -100dB is a very quiet room and 0 is 
// a very loud input. Under this setup most inputs should avg between -40 and 
// -5 dB, but it all depends on the environment, input gain, 
// and analyser.minDecibels.
var h1 = $('h1');
var helpers = require('./helpers.js');
var makePitchAnalyser = require('./makePitchAnalyser.js');

var contextClass = (window.AudioContext ||
  window.webkitAudioContext ||
  window.mozAudioContext ||
  window.oAudioContext ||
  window.msAudioContext);
if (contextClass) {
  var audioContext = new contextClass();
} else {
  h1.text("web audio is not enabled, sorry.");
}

var microphone;
var hiPass = helpers.makeFilter(audioContext,"HIGHPASS",80);
var loPass = helpers.makeFilter(audioContext,"LOWPASS",1200);
var filters = helpers.makeNodeChain();
filters.add(hiPass,loPass);

var streamLoaded = function(stream) {
  microphone = audioContext.createOscillator();
  microphone.start(0);
  microphone.connect(filters.first);
  startEmitting();
};

var startEmitting = function() {
  h1.text("Calibrating...");
  pitchAnalyser = makePitchAnalyser(audioContext,filters);
  pitchAnalyser.connect(audioContext.destination);
  pitchAnalyser.calibrate(function(){
    h1.text('Emitting audio stream.');
    pitchAnalyser.start(60,function(data){
      if (data.volume > pitchAnalyser.threshold) {
        console.log(data);
      }
    });
  });
};

var stopEmitting = function() {
  h1.text("TRANSMISSION ENDED");
  pitchAnalyser.end();
};

var resumeEmitting = function() {
  // In future the future can be separate function
  // to resume processing without re-calibrating
};

streamLoaded();

