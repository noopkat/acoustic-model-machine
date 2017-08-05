const fs = require('fs');
const spawn = require('child_process').spawn;
const srt = require('srt-stream');
const through = require('through2');
const leftPad = require('left-pad');

const subtitleFile = 'subtitle.srt';
const audioFile = 'qatea_audio.wav';

fs.createReadStream(subtitleFile)
  .pipe(srt.read())
  .pipe(through.obj(function (sub, enc, next) {
    const audioOutputFile = `speech${leftPad(sub.id, 6, '0')}.wav`;
    const transcription = createTranscription(sub.body, audioOutputFile);
    this.push(transcription);
    createAudioSample(sub, audioOutputFile, next); 
  }))
  .pipe(fs.createWriteStream('transcription.txt'))

function createTranscription(body, audioOutputFile) {
  return `${audioOutputFile}\t${body.join(' ').toLowerCase().replace(/(,|\.|-)/g, '')}\n\n`;
}

function createAudioSample(sub, audioOutputFile, next) {
  const st  = sub.startTime;
  const et  = sub.endTime;

  const args = ['-i', audioFile, '-ss', formatTime(st), '-to', formatTime(et, true), '-ab', '16000', '-ar', '16000', '-ac', '1', `audio/${audioOutputFile}`];
  console.log(args.join(' '));
  const extract = spawn('ffmpeg', args);

  extract.on('close', (code) => {
    next();
  });
}

function formatTime(time, round) {
  const { hours, minutes, seconds, ms } = time;
  return fTime = `${lp(hours)}:${lp(minutes)}:${lp(seconds)}.${lp(ms, 3)}`;
};

function lp(s, l=2) {
  return leftPad(s, l, '0');
}
