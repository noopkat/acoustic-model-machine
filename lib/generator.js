const path = require('path');
const fs = require('fs');
const srtToObj = require('srt-to-obj');
const eachSeries = require('async/eachSeries');
const colors = require('colors/safe');
const ProgressBar = require('progress');
const processor = require('./processor');

let transcriptionFile;
let progressBar;

const onParseSuccess = (opts) => (data) => {
 console.log('generating dataset...');

 if (!opts.v && !opts.verbose) {
   progressBar = createProgressBar(data.length);
 };

 eachSeries(data, onSubtitle(opts, progressBar), onSubtitleComplete);
};

const onParseError = (reason) => {
  console.error(colors.red(reason));
  process.exit(9);
};

const onSubtitle = (opts, progressBar) => (sub, next) => {
  if (progressBar) progressBar.tick();

  const transcription = processor.processSubtitle(sub, opts);
  transcriptionFile.write(transcription);

  processor.createAudioSample(sub, opts, next);
};

const onSubtitleComplete = (error) => {
  transcriptionFile.end();

  if (error) {
    console.error(colors.red(error));
    process.exit(9);
  } else {
    console.log(colors.green('complete.'));
    process.exit();
  }
};

const createProgressBar = (total) => {
  const options = {
    total: total,
    width: 70,
    complete: colors.cyan('='),
    incomplete: colors.grey('-')
  };

  return progressBar = new ProgressBar('[:bar] :current / :total', options);
};

const generateDataset = (opts) => {
 const subtitlePath = path.resolve(opts.subtitle);

 // create stream for transcription file
 transcriptionFile = fs.createWriteStream(path.resolve(opts['script-output']));


 srtToObj(subtitlePath)
   .then(onParseSuccess(opts))
   .catch(onParseError);
};

module.exports = { generateDataset }; 
