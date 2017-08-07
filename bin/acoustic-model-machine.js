#!/usr/bin/env node
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));
const srt = require('srt-stream');
const through = require('through2');
const processor = require('../lib/processor');
const help = require('../lib/help');

/*
 example use:
 node extractor.js --source=./mediafile.wav --subtitle=subtitle.srt --output-dir=./audio --script-output=./transcription.txt --output-prefix=speech
 node extractor.js --help 
*/

// print help and exit if --help passed
if (argv.help) {
  console.log(help);
  process.exit();
}

const defaultArgs = {
  'output-prefix': 'speech',
  'output-dir': '',
  'script-output': 'transcription.txt'
};

// merge default args with supplied args
const opts = Object.assign({}, defaultArgs, argv);

// check for subtitle and source
processor.findInvalidOptions(opts, (error, list) => {
  if (list.length) {
    console.error(list.join('\n'));
    process.exit(9);
  }
});

// parse subtitle file and generate transcription / audio files
fs.createReadStream(opts.subtitle)
  .pipe(srt.read())
  .pipe(through.obj(processor.processSubtitle(opts)))
  .pipe(fs.createWriteStream(opts['script-output']));

