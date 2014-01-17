var makeFilter = require('./makeFilter.js');
var makeNodeChain = require('./makeNodeChain');
var makeAnalyser = require('./makeAnalyser');
var pitchHelpers = require('./pitchhelpers.js');

module.exports = function(context,source) {
  var analyser = makeAnalyser(context,2048,-30,-144);
  analyser.threshold = analyser.minDecibels;
  source.connect(analyser);
  var _FFT = new Float32Array(analyser.frequencyBinCount);

  var _noiseCancel = function(freq,diff) {
    notchStrength = 0.7;
    var amt = diff*notchStrength;
    console.log("adding noise cancelling filter at "+freq+
                "hz with gain "+amt);
    source.disconnect(analyser);
    var filter = makeFilter(context,"PEAKING",freq,amt);
    var chain = analyser.ncFilters;
    if (chain) {
      chain.add(filter);
    } else {
      chain = analyser.ncFilters = makeNodeChain();
      chain.add(filter);
      source.connect(chain.first);
      chain.connect(analyser);
    }
  };

  var _convertToHz = function(buckets) {
    var targetFreq = buckets[1][0];
    var lowD = ((buckets[1][1])-(buckets[0][1]));
    var highD = ((buckets[1][1])-(buckets[2][1]));
    var shift = (lowD < highD ? -(highD - lowD) : (lowD - highD));
    var aShift = (shift*0.5)*0.1;
    var f = targetFreq+aShift;
    return f/analyser.frequencyBinCount*(context.sampleRate*0.5);
  };

  var _setThresh = function(avg,tStr) {
    if (avg > analyser.minDecibels * 0.27) {
      tStr = 0;
    } else if (avg > analyser.minDecibels * 0.4) {
      tStr *= 0.5;
    }
    analyser.threshold = avg+tStr;
  };

  var _analyseEnv = function(time,tStrength,done) {
    var interval = 50;
    var start = new Date().getTime();
    var e = start + time;
    var results = [];
    var tick = function() {
      analyser.getFloatFrequencyData(_FFT);
      var fftIndex = pitchHelpers.findMaxWithI(_FFT);
      var sample = {
        volume: fftIndex[1][1],
        hz: _convertToHz(fftIndex,context,analyser.frequencyBinCount)
      };
      results.push(sample);
      var cur = new Date().getTime();
      if (cur < e) {
        setTimeout(tick,interval);
      } else {
        var data = pitchHelpers.getPeaks(results);
        for (var f in data.freqs) {
          var freq = data.freqs[f];
          var freqAvg = freq.vol/freq.hits;
          if (freq.hits > results.length*0.3) {
            var diff = data.avg - freqAvg;
            _noiseCancel(f,diff);
          }
        }
        _setThresh(data.avg,tStrength);
        done();
      }
    };
    tick();
  };

  analyser.calibrate = function(time,tStrength,callback) {
    if (typeof(time) === "function") {
      callback = time;
      time = undefined;
    }
    if (typeof(tStrength) === "function") {
      callback = tStrength;
      tStrength = undefined;
    }
    this.smoothingTimeConstant = 0.9;
    time = time || 4000;
    tStrength = tStrength || 20;
    if (tStrength < 0 || tStrength > 50) {
      throw new Error("threshold strength must be between 0 and 50");
    }
    _analyseEnv(time,tStrength,callback);
  };

  analyser.process = function(callback) {
    this.getFloatFrequencyData(_FFT);
    var targetRange = pitchHelpers.findMaxWithI(_FFT);
    var volume = targetRange[1][1];
    var hz = _convertToHz(targetRange);
    var data = {
      hz: hz,
      volume: volume
    };
    callback(data);
  };

  analyser.start = function(interval,smooth,callback){
    var startInterval = function(){
      return setInterval(function(){
        analyser.process(callback);
      }, interval);
    };
    if (typeof(interval) === 'function') {
      callback = interval;
      interval = undefined;
    } else if (typeof(smooth) === 'function') {
      callback = smooth;
      smooth = undefined;
    }
    interval = interval || 60;
    this.smoothingTimeConstant = smooth || 0;
    var processor = startInterval();
    this.end = function() {
      clearInterval(processor);
    };
  };

  analyser.end = function(){
    return "End called but analyser not processing yet.";
  };

  return analyser;
};
