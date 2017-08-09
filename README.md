# Acoustic Model Machine

This package can help you put together a dataset for training a custom acoustic adaptation model for [Microsoft's Custom Speech Service](https://azure.microsoft.com/en-us/services/cognitive-services/custom-speech-service/).

It does so by using a video / audio file with matching subtitles to extract short passages of speech. These passages are saved to disk in the correct audio format needed. It'll then generate a transcription text file in the exact format required by Custom Speech Service. See the [official Custom Speech Service documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/custom-speech-service/customspeech-how-to-topics/cognitive-services-custom-speech-create-acoustic-model) for more details on acoustic adaptation model datasets.

My favourite captioning service to request subtitle files from is [Rev](http://rev.com); I highly recommend their amazing people to caption your content!

## Installation

Firstly, install [NodeJS](https://nodejs.org) on your operating system.  
You'll also need to have [ffmpeg](http://ffmpeg.org/download.html) installed. Windows can be tricky in particular; [this guide is a good one](http://www.wikihow.com/Install-FFmpeg-on-Windows).

Then, in your favourite terminal application, type the following:

```bash
npm install -g acoustic-model-machine

```

## Usage

```bash
acoustic-model-machine --source=/path/to/audio.wav --subtitle=/path/to/subtitle.srt --output-dir=mydatasetdir
```

### Options

+ `--source` _required_ - the path to the source file containing the speech you want to extract.
+ `--subtitle` _required_ - the path to the subtitle file that matches the source audio file. Requires .srt format.
+ `--output-dir` _optional_ - the path to where you'd like the dataset saved to. Default is the current working directory.
+ `--output-prefix` _optional_ - a custom prefix for the audio extraction files. Default is `speech`. See below section for output example.
+ `--verbose` _optional_ - see more verbose logging output when generating a dataset.

### Output

The completed dataset output will have the following structure:

```
mydatasetdir/
├── audio
│   ├── speech000001.wav
│   ├── speech000002.wav
│   ├── speech000003.wav
│   ├── speech000004.wav
│   ├── speech000005.wav
│   ├── speech000006.wav
│   ├── speech000007.wav
│   ├── speech000008.wav
│   ├── speech000009.wav
│   └── speech000010.wav
└── transcription.txt
```

### Importing the acoustic adaptation dataset into Custom Speech Service

1. Compress all audio files in the dataset into a flat zip file.
2. Follow the [official documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/custom-speech-service/customspeech-how-to-topics/cognitive-services-custom-speech-create-acoustic-model) to import.

## Roadmap

+ Importing of subtitles directly embedded in the source. For now, this needs to be performed manually with ffmpeg before using this tool.
+ Notice anything else missing? File an issue :smile:

## License

MIT.
