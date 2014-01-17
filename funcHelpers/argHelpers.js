module.exports = {
  isD: function(arg) {
    return (typeof arg !== 'undefined');
  },
  isF: function(arg) {
    return (typeof arg === 'function');
  },
  isU: function(arg) {
    return (typeof arg === 'undefined');
  },
  paste: function(opts,obj) {
    for (var key in opts) {
      obj[key] = opts[key];
    }
  },
  translate: function(obj, nickname, name) {
    if (obj[nickname] !== "undefined") {
      obj[name] = obj[nickname];
      delete obj[nickname];
    }
  }
};
