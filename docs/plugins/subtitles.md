# Subtitles

subtitle plugin allows you to fetch  and parse subtitle file from a URL and you an read text from the parsed file

## Usage

If you want to access Subtitles in your App code directly, import the *Subtitles* plugin from the Lightning SDK:

```js
import { Subtitles } from '@lightningjs/sdk'
```


## Available methods

### fetchAndParseSubs

`fetchAndParseSubs` method expects a valid file URL as an argument.
This method will fetch a file from the URL and parse it to create a list of objects. created subtitles list is stored in the plugin.
This method returns a promise that resolves to parsed subtitles as a list of objects containing {start, end, payload}.
```js
Subtitles.fetchAndParseSubs(URL)
```

### getSubtitleByTimeIndex
From the stored subtitles you can get subtitles as text, when you pass currentTime(in seconds) as an argument to the method.

```js
Subtitles.getSubtitleByTimeIndex(currentTime)
```

### clearCurrentSubtitle

Parsed subtitles will be stored in the plugin, `clearCurrentSubtitle` clears all the stored subtitles in the plugin.

```js
Subtitles.clearCurrentSubtitle()
```

