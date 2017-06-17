function to_bytes(sum, size){
  var bytes = [];
  for(var i = 0; i < size; i++){
    var byte = sum % 256;
    sum = Math.trunc(sum / 256);
    bytes.push(byte);
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
      console.log(bytes ,to_sting(bytes));
      return;
    }

    for(var sum = 256 ** i; sum < limit; sum++){
      var bytes = to_bytes(sum, size);
      if(md5(bytes) == hash){
        console.log(bytes ,to_sting(bytes));
        return;
      }
    }
  }
}

var hash = 'c20ad4d76fe97759aa27a0c99bff6710';
brute_md5(2, hash);
