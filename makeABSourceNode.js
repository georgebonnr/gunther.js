module.exports = makeABSourceNode = function(
    context,
    fftSize,
    maxdec,
    mindec,
    smoothing) {
    if (arguments.length === 3) {
      smoothing = maxdec;
      maxdec = undefined;
    }
    if (!context) {throw new Error("context argument required");}
    var analyser = context.createAnalyser();
    analyser.context = context;
    if (fftSize) {analyser.fftSize = fftSize;}
    if (maxdec) {analyser.maxDecibels = maxdec;}
    if (mindec) {analyser.minDecibels = mindec;}
    if (smoothing) {analyser.smoothingTimeConstant = smoothing;}
    return analyser;
  };