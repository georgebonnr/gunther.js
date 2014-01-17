module.exports = paste = function(options,object) {
  for (var key in options) {
    object[key] = options[key];
  }
};
