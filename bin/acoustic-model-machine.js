#!/usr/bin/env node
const fs = require('fs');
const minimist = require('minimist');
const colors = require('colors/safe');

const util = require('../lib/util');
const help = require('../lib/help');
const generator = require('../lib/generator');

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

// set up defaults
const defaultArgs = {
  'output-prefix': 'speech',
  'output-dir': '',
  'script-output': 'transcription.txt'
};

// merge default args with supplied args
const opts = Object.assign({}, defaultArgs, argv);

// check for subtitle and source first
util.findInvalidOptions(opts, (error, list) => {
  if (list.length) {
    console.error(colors.red(list.join('\n')));
    process.exit(9);
  }

  // parse subtitle file and generate transcription / audio files
  generator.generateDataset(opts);
});



