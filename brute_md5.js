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

    function brute_md5(){
      for(var i = 0; ; i++){
        var size = i + 1;
        var limit = 256 ** size;

        var start = new Date().getTime();
        md5(to_bytes(limit - 1));
        var end = new Date().getTime();

        this.fire('size', {id: size, max: limit, measure: ((end - start) || 1) * (limit - (256 ** i)) / 450 });

        var bytes = to_bytes(0, size);
        var actual = md5(bytes);
        if(hash == actual){
          this.fire('result', to_sting(bytes));
          return;
        }

        for(var sum = 256 ** i; sum < limit; sum++){
          var bytes = to_bytes(sum, size);
          var actual = md5(bytes);

          if ( sum % Math.ceil(1 / 100 * limit) == 0) {
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

    brute_md5.call(this);
  }).on('size', function(params){
    var progress = document.createElement('progress');
    progress.id = 'progress_' + params.id;
    progress.max = params.max;
    progress.value = 0;

    var time = document.createElement('span');
    var start = new Date();
    var end = new Date(start.getTime() + params.measure);
    var estimated = countdown(start, end);
    if (estimated.toString().length == 0){
      estimated = '0 milliseconds'
    }
    time.innerHTML = 'estimated: ' + estimated;

    var li = document.createElement('li');
    li.appendChild(progress);
    li.appendChild(time);

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

    var hash = document.getElementById('hash');
    hash.readOnly = false;

    var success = document.getElementById('success');
    success.innerHTML = 'Success!';
  });
};

function decrypt(){
  var success = document.getElementById('success');
  success.innerHTML = '';
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
  hash.readOnly = true;
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
  var hash = document.getElementById('hash');

  decrypt.disabled = false;
  stop.disabled = true;
  hash.readOnly = false;

  worker = newWorker();
}

var worker = newWorker();
