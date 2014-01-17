module.exports = makeAnalyser = function(fftSize, smooth, maxdec, mindec) {
    var analyser = this.context.createAnalyser();
    analyser.context = this.context;
    if (fftSize) {analyser.fftSize = fftSize;}
    if (smooth) {analyser.smoothingTimeConstant = smooth;}
    if (maxdec) {analyser.maxDecibels = maxdec;}
    if (mindec) {analyser.minDecibels = mindec;}
    return analyser;
  };
