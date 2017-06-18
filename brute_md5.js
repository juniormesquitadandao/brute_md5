function newWorker(){
    return cw(function(hash){
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

    function brute_md5(hash){
      for(var i = 0; ; i++){
        var size = i + 1;
        var limit = 256 ** size;
        this.fire('size', {id: size, max: limit});

        var bytes = to_bytes(0, size);
        var actual = md5(bytes);
        if(hash == actual){
          this.fire('result', to_sting(bytes));
          return;
        }

        for(var sum = 256 ** i; sum < limit; sum++){
          var bytes = to_bytes(sum, size);
          var actual = md5(bytes);

          if ( sum % Math.ceil(limit / 10) == 0) {
            this.fire('progress', {id: size, value: sum});
          }

          if(hash == actual){
            this.fire('result', to_sting(bytes));
            return;
          }
        }
        this.fire('progress', {id: size, value: sum});
      }
    }

    brute_md5.call(this, hash);
  }).on('size', function(params){
    var progress = document.createElement('progress');
    progress.id = 'progress_' + params.id;
    progress.max = params.max;
    progress.value = 0;

    var li = document.createElement('li');
    li.appendChild(progress);

    var ol = document.getElementById('progress');
    ol.appendChild(li);

    var text = document.getElementById('text');
    text.placeholder += '#';
  }).on('progress',function(params){
    var progress = document.getElementById('progress_' + params.id);
    progress.value = params.value;
  }).on('result',function(text){
    var input = document.getElementById('text');
    input.value = text;

    var decrypt = document.getElementById('decrypt');
    decrypt.disabled = false;

    var stop = document.getElementById('stop');
    stop.disabled = true;
  });
};

function decrypt(){
  var hash = document.getElementById('hash');
  var value = hash.value.trim().toLocaleLowerCase();
  var decrypt = document.getElementById('decrypt');

  var error = document.getElementById('error');
  if(value.length != 32){
    error.innerHTML = '*invalid';
    return;
  } else {
    error.innerHTML = '';
  }

  var text = document.getElementById('text');
  var stop = document.getElementById('stop');
  var progress = document.getElementById('progress');
  var progressDiv = progress.parentElement;

  decrypt.disabled = true;
  stop.disabled = false;
  text.placeholder = '';
  text.value = '';
  progress.remove();
  progress = document.createElement('ol');
  progress.id = 'progress';
  progressDiv.appendChild(progress);
  worker.data(value);
}

function stop(){
  worker.close();

  var decrypt = document.getElementById('decrypt');
  var stop = document.getElementById('stop');

  decrypt.disabled = false;
  stop.disabled = true;

  worker = newWorker();
}

var worker = newWorker();
