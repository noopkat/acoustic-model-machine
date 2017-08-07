const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const leftPad = require('left-pad');
const reject = require('async/reject');

// creates errors for missing options / files
const findInvalidOptions = (opts, callback) => {
  const requiredOptions = ['subtitle', 'source'];
  const errors = [];

  requiredOptions.forEach((option) => {
    const optionVal = opts[option];
    if (!optionVal) {
      return errors.push(new Error(`${option} is a required argument`));
    }
  });

  reject(requiredOptions.map((o) => opts[o]), (filePath, callback) => {
    if (filePath === undefined) return callback(null, true);
    fs.access(filePath, (err) => callback(null, !err));
  }, (err, results) => {
    const missingFileErrors = results.map((file) => new Error(`file ${file} could not be found`));
    return callback(null, errors.concat(missingFileErrors));
  });
};

// leftpad shorthand
const lp = (s, l=2) => leftPad(s, l, '0'); 

// builds string for a transcription file single line
const createTranscription = (body, audioFilename) => {
  const transcriptionBody = body.join(' ').toLowerCase().replace(/(,|\.|-)/g, '');
  return `${audioFilename}\t${transcriptionBody}\n\n`;
}

// formats time into ffmpeg format ie. 00:00:00.000
const formatTime = (time, round) => {
  const { hours, minutes, seconds, ms } = time;
  return fTime = `${lp(hours)}:${lp(minutes)}:${lp(seconds)}.${lp(ms, 3)}`;
};

// runs ffmpeg to extract audio utterance and save to disk with correct properties
const createAudioSample = (sub, opts, audioOutputPath, next) => {
  const st  = sub.startTime;
  const et  = sub.endTime;

  const args = ['-i', opts.source, '-ss', formatTime(st), '-to', formatTime(et, true), '-vn', '-ab', '16000', '-ar', '16000', '-ac', '1', audioOutputPath];
  console.log(args.join(' '));
  const extract = spawn('ffmpeg', args);

  extract.on('close', (code) => {
    if (code === 0) next();
  });

  extract.on('error', (error) => {
    console.error('ffpmeg error: ', error);
  });
}

// runs on each subtitle, produces transcription line and ffmpeg audio extraction
const processSubtitle = (opts) => function(sub, enc, next) {
  const index = leftPad(sub.id, 6, '0');
  const audioFilename = `${opts['output-prefix']}${index}.wav`; 
  const audioOutputPath = path.join(opts['output-dir'], audioFilename);
  const transcription = createTranscription(sub.body, audioFilename);

  this.push(transcription);
  createAudioSample(sub, opts, audioOutputPath, next); 
};

module.exports = { findInvalidOptions, processSubtitle };

