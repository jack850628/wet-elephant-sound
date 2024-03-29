const concatAudioBuffers = require('concat-audio-buffers');
const lamejs = require("lamejs");

if (!window.AudioContext) {
    window.AudioContext = window.webkitAudioContext;
}

var audioContext = new window.AudioContext();
var audioBufferSourceNode;
var gainNode;
var audioLengths;
var playing = false;
var playStartTime;
var currentPlayIndex;
var nextUpdateTimePoint;

gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);

export function playByteArray(arrayBuffers, onPlayItemUpdate = (index) => {}, onEnded = ()=>{}) {
    prepareAudios(arrayBuffers)
        .then(audioBuffer => play(audioContext, audioBuffer, onPlayItemUpdate, onEnded))
        .catch(e => console.log(e));
}

export function stopByteArray(){
    if(audioBufferSourceNode)
        audioBufferSourceNode.stop();
}

export function downloadAudio(arrayBuffers, schedule = (value)=>{}){
    prepareAudios(arrayBuffers)
        .then(audioBuffer => audioBufferToWav(audioBuffer, schedule))
        .then(url => {
            //window.open(url);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', url.split('/').pop() + '.mp3');
            link.click();
            schedule(100);
        })
        .catch(e => console.error(e));
}

export function setValue(value){
    gainNode.gain.value = value;
}

function prepareAudios(arrayBuffers){
    return new Promise((resolve, reject) => {
        Promise.all(arrayBuffers.map(a => audioContext.decodeAudioData(a.slice(0)))).then(audioBuffers => {
            audioLengths = audioBuffers.map(i => i.duration);
            concatAudioBuffers(audioBuffers, 1, function(error, audioBuffer){
                if (error) {
                    reject(error);
                } else {
                    resolve(audioBuffer);
                }
            });
        }).catch(e => reject(e));
    });
}

function play(audioContext, buffer, onPlayItemUpdate, onEnded) {
    audioBufferSourceNode = audioContext.createBufferSource();
    audioBufferSourceNode.onended = () => {
        playing = false;
        onEnded();
    };
    audioBufferSourceNode.buffer = buffer;
    audioBufferSourceNode.connect(gainNode);
    nextUpdateTimePoint = 0;
    currentPlayIndex = -1;
    audioBufferSourceNode.start();
    playStartTime = audioContext.currentTime;
    playing = true;
    playItemUpdate.call({onPlayItemUpdate});
}

function playItemUpdate(){
    if(audioContext.currentTime - playStartTime > nextUpdateTimePoint){
        currentPlayIndex++;
        if(currentPlayIndex < audioLengths.length){
            this.onPlayItemUpdate(currentPlayIndex);
            nextUpdateTimePoint += audioLengths[currentPlayIndex];
        }
    }
    if(playing)
        requestAnimationFrame(playItemUpdate.bind(this));
}


function audioBufferToWav(aBuffer, schedule) {
    let numOfChan = aBuffer.numberOfChannels,
        btwLength = aBuffer.length * numOfChan * 2 + 44,
        btwArrBuff = new ArrayBuffer(btwLength),
        btwView = new DataView(btwArrBuff),
        btwChnls = [],
        btwIndex,
        btwSample,
        btwOffset = 0,
        btwPos = 0;
    setUint32(0x46464952); // "RIFF"
    setUint32(btwLength - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(aBuffer.sampleRate);
    setUint32(aBuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit
    setUint32(0x61746164); // "data" - chunk
    setUint32(btwLength - btwPos - 4); // chunk length

    for (btwIndex = 0; btwIndex < aBuffer.numberOfChannels; btwIndex++)
        btwChnls.push(aBuffer.getChannelData(btwIndex));

    while (btwPos < btwLength) {
        for (btwIndex = 0; btwIndex < numOfChan; btwIndex++) {
            // interleave btwChnls
            btwSample = Math.max(-1, Math.min(1, btwChnls[btwIndex][btwOffset])); // clamp
            btwSample = (0.5 + btwSample < 0 ? btwSample * 32768 : btwSample * 32767) | 0; // scale to 16-bit signed int
            btwView.setInt16(btwPos, btwSample, true); // write 16-bit sample
            btwPos += 2;
        }
        btwOffset++; // next source sample
    }

    let wavHdr = lamejs.WavHeader.readHeader(new DataView(btwArrBuff));
    let wavSamples = new Int16Array(btwArrBuff, wavHdr.dataOffset, wavHdr.dataLen / 2);

    function setUint16(data) {
        btwView.setUint16(btwPos, data, true);
        btwPos += 2;
    }

    function setUint32(data) {
        btwView.setUint32(btwPos, data, true);
        btwPos += 4;
    }

    return wavToMp3(wavHdr.channels, wavHdr.sampleRate, wavSamples, schedule);
}

function wavToMp3(channels, sampleRate, samples, schedule) {
    return new Promise((resolve, reject) => {
        var buffer = [];
        var mp3enc = new lamejs.Mp3Encoder(channels, sampleRate, 128);
        var remaining = samples.length;
        var samplesPerFrame = 1152;
        var i = 0;
        var scheduleUnit = 100 / (remaining / samplesPerFrame), scheduleValue;
        setTimeout(f1);
        function f1(){
            var _scheduleValue = parseInt(i / samplesPerFrame * scheduleUnit)
            if(scheduleValue != _scheduleValue){
                scheduleValue = _scheduleValue;
                schedule(scheduleValue);
            }
            if(remaining >= samplesPerFrame){
                var mono = samples.subarray(i, i + samplesPerFrame);
                var mp3buf = mp3enc.encodeBuffer(mono);
                if (mp3buf.length > 0) {
                    buffer.push(new Int8Array(mp3buf));
                }
                remaining -= samplesPerFrame;
                i += samplesPerFrame
                setTimeout(f1, 0);
            }else{
                setTimeout(f2, 0)
            }
        }
        function f2(){
            var d = mp3enc.flush();
            if(d.length > 0){
                buffer.push(new Int8Array(d));
            }
        
            var mp3Blob = new Blob(buffer, {type: 'audio/mp3'});
            resolve(window.URL.createObjectURL(mp3Blob));
        }
    });
}