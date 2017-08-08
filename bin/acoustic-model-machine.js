#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const srtToObj = require('srt-to-obj');
const eachSeries = require('async/eachSeries');
const colors = require('colors/safe');
const ProgressBar = require('progress');

const processor = require('../lib/processor');
const help = require('../lib/help');


/*
 example use:
 node extractor.js --source=./mediafile.wav --subtitle=subtitle.srt --output-dir=./audio --script-output=./transcription.txt --output-prefix=speech
 node extractor.js --help 
*/

// parse args
const argv = minimist(process.argv.slice(2));

// print help and exit if --help passed
if (argv.help) {
  console.log(help);
  process.exit();
}

const generateDataset = () => {
 const subtitlePath = path.resolve(opts.subtitle);

 srtToObj(subtitlePath)
   .then(onParseSuccess)
   .catch(onParseError);
};

const onParseSuccess = (data) => {
 console.log('generating dataset...');

 let progressBar;
 if (!opts.v && !opts.verbose) {
   progressBar = createProgressBar(data.length);
 };

 eachSeries(data, onSubtitle(progressBar), onSubtitleComplete);
};

const onParseError = (reason) => {
  console.error(colors.red(reason));
  process.exit(9);
};

const onSubtitle = (progressBar) => (sub, next) => {
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


// set up defaults
const defaultArgs = {
  'output-prefix': 'speech',
  'output-dir': '',
  'script-output': 'transcription.txt'
};

// merge default args with supplied args
const opts = Object.assign({}, defaultArgs, argv);

// create stream for transcription file
const transcriptionFile = fs.createWriteStream(path.resolve(opts['script-output']));

// check for subtitle and source first
processor.findInvalidOptions(opts, (error, list) => {
  if (list.length) {
    console.error(colors.red(list.join('\n')));
    process.exit(9);
  }

  // parse subtitle file and generate transcription / audio files
  generateDataset();
});



