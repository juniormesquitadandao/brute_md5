function newWorker(){
  return cw(function(params){
    try {
      importScripts('https://cdn.rawgit.com/emn178/js-md5/gh-pages/build/md5.min.js');

      var hash = params.hash;
      var avaliables = [];
      params.characters.forEach(function(character){
        avaliables[character.charCodeAt()] = true;
      });

      function to_bytes(sum, size){
        var bytes = [];
        for(var i = 0; i < size; i++){
          var byte = sum % 256;
          sum = Math.trunc(sum / 256);

          if(!avaliables[byte]){
            return null;
          }

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
          this.fire('size', size);

          for(var sum = 256 ** i; sum < limit; sum++){
            var bytes = to_bytes(sum, size);
            if (bytes == null) {
              if ( sum % Math.ceil(1 / 100 * limit) == 0) {
                var progress = sum / Math.ceil(1 / 100 * limit);
                this.fire('progress', {id: size, value: progress});
              }
              continue;
            }

            var actual = md5(bytes);
            if ( sum % Math.ceil(1 / 100 * limit) == 0) {
              var progress = sum / Math.ceil(1 / 100 * limit);
              this.fire('progress', {id: size, value: progress});
            }

            if(hash == actual){
              this.fire('result', { text: to_sting(bytes), progress: size });
              return;
            }
          }
          this.fire('progress', {id: size, end: true});
        }
      }

      brute_md5.call(this);
    } catch (e) {
      this.fire('error', e);
      return e;
    }
  }).on('error', function(e){
    stop();
    var error = document.getElementById('error');
    error.innerHTML = '*' + e.message;
    console.log(e);
  }).on('size', function(id){
    var progress = document.createElement('progress');
    progress.id = 'progress_' + id;
    progress.max = 100;
    progress.value = 0;
    progress.start = new Date();

    var time = document.createElement('span');
    time.id = 'time_' + id;
    time.innerHTML = ' 0% - calculating...'

    var li = document.createElement('li');
    li.appendChild(progress);
    li.appendChild(time);

    var ol = document.getElementById('progress');
    ol.appendChild(li);

    var text = document.getElementById('text');
    text.placeholder += '#';

    var characters = document.getElementById('characters');
    characters.innerHTML = 'must be ' + id + ' or more characters.';
  }).on('progress',function(params){
    var progress = document.getElementById('progress_' + params.id);
    var time = document.getElementById('time_'+params.id);
    if (params.end) {
      progress.value = progress.max;
      var end = new Date();
      var total = countdown(progress.start, end);
      if (total.toString().length == 0){
        total = '0 milliseconds'
      }
      time.innerHTML = ' ' + progress.value + '% - ' + total;
    } else {
      progress.value = params.value;
      var measure = new Date().getTime() - progress.start.getTime();
      var measure = (measure / progress.value) * (progress.max - progress.value);
      var end = new Date(progress.start.getTime() + measure);
      var estimated = countdown(progress.start, end);
      if (estimated.toString().length == 0){
        estimated = '0 milliseconds'
      }
      time.innerHTML = ' ' + progress.value + '% - ' + estimated;
    }
  }).on('result',function(params){
    var input = document.getElementById('text');
    input.value = params.text;

    var decrypt = document.getElementById('decrypt');
    decrypt.disabled = false;

    var stop = document.getElementById('stop');
    stop.disabled = true;

    var hash = document.getElementById('hash');
    hash.readOnly = false;

    var success = document.getElementById('success');
    success.innerHTML = 'Success!';

    Push.create("BruteMD5", {
      body: 'Decrypted ' + hash.value + ' to ' + input.value,
      timeout: 7000,
      onClick: function () {
          window.focus();
          this.close();
      }
    });

    var progress = document.getElementById('progress_' + params.progress);
    var time = document.getElementById('time_'+params.progress);
    var end = new Date();
    var total = countdown(progress.start, end);
    if (total.toString().length == 0){
      total = '0 milliseconds'
    }
    time.innerHTML = ' ' + progress.value + '% - ' + total;
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
  worker.data({hash: value, characters: get_characters()});

  return false;
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

function enable(){
  Push.create("BruteMD5", {
    body: 'Enabled',
    timeout: 1000,
    onClick: function () {
      window.focus();
      this.close();
    }
  });
}

function set_characters(){
  var characters_avaliables = document.getElementById('characters_avaliables');
  characters_avaliables.value = " !\"\#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
}

function get_characters(){
  var characters_avaliables = document.getElementById('characters_avaliables');
  return characters_avaliables.value.split('');
}