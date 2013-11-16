module.exports = makeNodeChain = function(first,output){
    var chain = {
      first: first || null,
      last: null,
      output: output || null
    };
    chain.connect = function(node){
      this.output = node;
      if (this.last) {this.last.connect(this.output);}
    };
    chain.disconnect = function(node){
      this.output = null;
      if (this.last) {this.last.disconnect(node);}
    };
    chain.add = function(filter){
      if (arguments.length > 1) {
        for (var i=0; i<arguments.length; i++) {
          this.add(arguments[i]);
        }
        return this;
      }
      if (!this.first) {
        this.first = filter;
        this.last = filter;
        if (this.output) {this.last.connect(this.output);}
      } else {
        if (this.output) {
          this.last.disconnect(this.output);
          filter.connect(this.output);
        }
        this.last.connect(filter);
        this.last = filter;
      }
      return this;
    };
    return chain;
  };