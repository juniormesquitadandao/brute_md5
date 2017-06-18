var worker = cw(function(hash){
  importScripts('https://cdn.rawgit.com/emn178/js-md5/gh-pages/build/md5.min.js');

  function to_bytes(sum, size){
    var bytes = [];
    for(var i = 0; i < size; i++){
      var byte = sum % 256;
      sum = Math.trunc(sum / 256);
      bytes[i] = byte;
    }
    return bytes;
  }

  function to_sting(bytes){
    return String.fromCharCode(...bytes);
  }

  function brute_md5(max, hash){
    for(var i = 0; i < max; i++){
      var size = i + 1;
      var limit = 256 ** size;

      var bytes = to_bytes(0, size);
      if(md5(bytes) == hash){
        this.fire('match', to_sting(bytes));
        return;
      }

      for(var sum = 256 ** i; sum < limit; sum++){
        var bytes = to_bytes(sum, size);
        if(md5(bytes) == hash){
          this.fire('match', to_sting(bytes));
          return;
        }
      }
      this.fire('match', i);
    }
  }

  brute_md5.call(this, 2, hash);
  this.fire('finish');
});

worker.on('match',function(text){
  console.log(text);
});

worker.on('finish',function(){
  console.log('finish');
});

worker.data('81dc9bdb52d04dc20036dbd8313ed055');