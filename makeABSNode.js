var a = require('./funcHelpers/argHelpers.js');

module.exports = makeABSNode = function(
    buffer,
    loop,
    playbackRate,
    loopStart,
    loopEnd,
    onended) {
  if (a.isU(buffer)) {
    throw new Error("buffer must be defined.");
  }
  var node = this.context.createAudioBufferSourceNode();
  if (typeof loop !== "undefined") {node.loop = loop;}
  return node;
};
