# SubtitlesParser

subtitle plugin allows you to fetch and parse the subtitle file from the given URL and you can read the subtitle text from the parsed file based on the current videoplayback time.

## Usage

If you want to access SubtitlesParser in your App code directly, import the *SubtitlesParser* plugin from the Lightning SDK:

```js
import { SubtitlesParser } from '@lightningjs/sdk'
```


## Available methods

### fetchAndParseSubs

`fetchAndParseSubs` method expects a valid file URL as an argument.
This method will fetch a file from the URL and parse it to create a list of objects. created subtitles list is stored in the plugin.
This method returns a promise that resolves to parsed subtitles as a list of objects containing {start, end, payload}.
```js
const subtitlesUrl = 'http://abc.def.com/xyz.srt'
SubtitlesParser.fetchAndParseSubs(subtitlesUrl)
```
### customParser

Default parser in subtitle plugin can parse .srt and .vvt files. If you don't want to use the default parser you can also send a customParser as a callback to `fetchAndParseSubs` as a second argument, customParser should return a list of subtitle objects that contains
{start: <float>, end: <float>, payload: <string>}


```js
const customParser = (str) = {
    ...
    ...
    return [{start: 3, end: 10, payload: 'this is subtitle text'}, { start: 11, end: 14, payload: 'this is subtitle text2'}, ...]
}
const subtitlesUrl = 'http://abc.def.com/xyz.srt'
SubtitlesParser.fetchAndParseSubs(subtitlesUrl, customParser)
```

### removeSubtitleTextStyles

By default, all the TextStyles in the subtitle string are removed, you can pass {removeSubtitleTextStyles: false} as
the third argument to keep text styles in subtitle string

```js
SubtitlesParser.fetchAndParseSubs(URL, null, {removeSubtitleTextStyles: false})
```
### getSubtitleByTimeIndex
From the stored subtitles you can get subtitles as text when you pass currentTime(in seconds) as an argument to the method.

```js
SubtitlesParser.getSubtitleByTimeIndex(currentTime)
```

### clearCurrentSubtitle

`clearCurrentSubtitle` method will clear all the stored subtitles in the plugin.

```js
SubtitlesParser.clearCurrentSubtitle()
```

