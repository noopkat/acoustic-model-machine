const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const leftPad = require('left-pad');
const colors = require('colors/safe');

// builds string for a transcription file single line
const createTranscription = (body, audioFilename) => {
  const transcriptionBody = body.replace(/\n/g, ' ').replace(/(,|\.|-|:|")/g, '');

  return `${audioFilename}\t${transcriptionBody}\n\n`;
}

// formats time into ffmpeg format ie. 00:00:00.000
const formatTime = (time) => {
  return fTime = time.replace(',', '.');
};

// runs ffmpeg to extract audio utterance and save to disk with correct properties
const createAudioSample = (sub, opts, next) => {
  const { start, end } = sub;
  const audioFilename = getAudioFilename(opts['output-prefix'], sub);
  const audioOutputPath = getAudioOutputPath(opts['output-dir'], audioFilename);

  const args = ['-i', opts.source, '-ss', formatTime(start), '-to', formatTime(end), '-vn', '-ab', '16000', '-ar', '16000', '-ac', '1', audioOutputPath];

  if (opts.verbose || opts.v) {
    console.log(`extracting ${colors.cyan(start + ' -> ' + end)} and saving as ${colors.yellow(audioOutputPath)}`);
  };

  // run ffmpeg to extract audio
  const extract = spawn('ffmpeg', args);

  extract.on('close', (code) => {
    if (code === 0) setTimeout(next, 400);
    else next(new Error('ffmpeg failed with code ', code));
  });

  extract.on('error', (error) => {
    next(error);
  });
}

const getAudioOutputPath = (outputDir, audioFilename) => path.resolve(path.join(outputDir, audioFilename));

const getAudioFilename = (outputPrefix, sub) => {
  const index = leftPad(sub.index, 6, '0');

  return `${outputPrefix}${index}.wav`;
};

// runs on each subtitle, produces transcription line 
const processSubtitle = (sub, opts) => {
  const audioFilename = getAudioFilename(opts['output-prefix'], sub);
  const transcription = createTranscription(sub.text, audioFilename);

  return transcription;
};

module.exports = { processSubtitle, createAudioSample };

