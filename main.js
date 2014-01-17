var h1 = $('h1');
var gunther = require('./gunther.js');

var contextClass = (window.AudioContext ||
  window.webkitAudioContext ||
  window.mozAudioContext ||
  window.oAudioContext ||
  window.msAudioContext);
if (contextClass) {
  var audioContext = new contextClass();
  gunther.use(audioContext);
} else {
  h1.text("web audio is not enabled, sorry.");
}

var microphone;
var hiPass = gunther.makeFilter("HIGHPASS",80);
var loPass = gunther.makeFilter("LOWPASS",1200);
var filters = gunther.makeNodeChain();
filters.add(hiPass,loPass);

var streamLoaded = function(stream) {
  microphone = audioContext.createOscillator();
  microphone.connect(filters.first);
  var ABSNode = gunther.makeABSNode(audioContext);
  console.log(filters);
  startEmitting();
};

var startEmitting = function() {
  h1.text("Calibrating...");
  pitchAnalyser = gunther.makePitchAnalyser(audioContext,filters);
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

