const fs = require('fs');
const spawn = require('child_process').spawn;
const srt = require('srt-stream');
const through = require('through2');
const leftPad = require('left-pad');
const argv = require('minimist')(process.argv.slice(2));
const path = require('path');

/*
 dynamic parts:

 + subtitle file
 + audio file
 + location of audio output (utterances)
 + location and name of the transcription file

 node extractor.js --source=./mediafile.wav --subtitle=subtitle.srt --output-dir=./audio --script-output=./transcription.txt --output-prefix=speech
 node extractor.js --help 

 features

 + silence at the beginning and end of each utterance
 + validate the subtitle file for start + endtime format

*/

const defaultArgs = {
  'output-prefix': 'speech',
  'output-dir': '',
  'script-output': 'transcription.txt'
};

const opts = Object.assign({}, defaultArgs, argv); 

console.log(opts);

function lp(s, l=2) {
  return leftPad(s, l, '0');
}

function createTranscription(body, audioFilename) {
  const transcriptionBody = body.join(' ').toLowerCase().replace(/(,|\.|-)/g, '');
  return `${audioFilename}\t${transcriptionBody}\n\n`;
}

function formatTime(time, round) {
  const { hours, minutes, seconds, ms } = time;
  return fTime = `${lp(hours)}:${lp(minutes)}:${lp(seconds)}.${lp(ms, 3)}`;
};

function createAudioSample(sub, audioOutputPath, next) {
  const st  = sub.startTime;
  const et  = sub.endTime;

  const args = ['-i', opts.source, '-ss', formatTime(st), '-to', formatTime(et, true), '-vn', '-ab', '16000', '-ar', '16000', '-ac', '1', audioOutputPath];
  console.log(args.join(' '));
  const extract = spawn('ffmpeg', args);

  extract.on('close', (code) => {
    next();
  });
}

function processSubtitle(sub, enc, next) {
  const index = leftPad(sub.id, 6, '0');
  const audioFilename = `${opts['output-prefix']}${index}.wav`; 
  const audioOutputPath = path.join(opts['output-dir'], audioFilename);
  const transcription = createTranscription(sub.body, audioFilename);
  this.push(transcription);
  createAudioSample(sub, audioOutputPath, next); 
};

fs.createReadStream(opts.subtitle)
  .pipe(srt.read())
  .pipe(through.obj(processSubtitle))
  .pipe(fs.createWriteStream(opts['script-output']));

