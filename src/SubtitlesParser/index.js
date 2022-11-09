/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export default class SubtitlesParser {
  // @ params url: subtitle file URL
  // @return parsed subtitles as list of objects
  // also stores parsed data
  constructor() {
    SubtitlesParser.removeSubtitleTextStyles = false
    SubtitlesParser.clearCurrentSubtitle()
  }
  // static _currentSubtitle = null;
  // static _nextSubtitle = null;
  // static _captions = null;
  static fetchAndParseSubs(url, customParser = false, ParseOptions = {}) {
    const _url = new URL(url)
    if (_url.protocol !== 'https:' || _url.protocol !== 'https:' || !_url.hostname) {
      console.log('Invalid URL')
      return Promise.reject(new Error('Invalid URL'))
    }
    if (ParseOptions && 'removeSubtitleTextStyles' in ParseOptions) {
      this.removeSubtitleTextStyles = ParseOptions.removeSubtitleTextStyles
    }
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(data => {
          let subtitleData = data.text()
          this.clearCurrentSubtitle()
          if (customParser && typeof customParser === 'function') {
            this._captions = customParser(subtitleData)
          } else {
            this._captions = this.parseSubtitles(subtitleData)
          }
          if (this._captions && this._captions.length) {
            resolve(this._captions)
          } else {
            reject('Failed to parse subtitles: invalid subtitles length')
          }
        })
        .catch(error => {
          console.log('Fetching file Failed:', error)
          this.clearCurrentSubtitle()
          reject('Fetching file Failed')
        })
    })
  }

  // clears stored subtitles data
  static clearCurrentSubtitle() {
    this._currentSubtitle = null
    this._nextSubtitle = null
  }
  static set removeSubtitleTextStyles(v) {
    this._subtitleTextStyles = !v
  }

  // @params currentTime: time as seconds
  // @return subtitle as text at passed currentTime
  static getSubtitleByTimeIndex(currentTime) {
    console.log('currentTime:', currentTime)
    console.log('this._nextSubtitle:', this._nextSubtitle)
    console.log('this._currentSubtitle:', this._currentSubtitle)
    if (!currentTime || isNaN(currentTime)) {
      console.log('invalid currentTime')
      return
    }
    let self = this
    if (
      this._captions &&
      this._captions.length &&
      this._currentSubtitle &&
      this._nextSubtitle &&
      Number(currentTime.toFixed(0)) < Number(this._nextSubtitle.end.toFixed(0)) &&
      Number(currentTime.toFixed(0)) >= Number(this._currentSubtitle.start.toFixed(0))
    ) {
      if (
        Number(currentTime.toFixed(0)) >= Number(this._currentSubtitle.start.toFixed(0)) &&
        Number(currentTime.toFixed(0)) < Number(this._currentSubtitle.end.toFixed(0))
      ) {
        return this._currentSubtitle.payload
      } else if (
        Number(currentTime.toFixed(0)) >= Number(this._nextSubtitle.start.toFixed(0)) &&
        Number(currentTime.toFixed(0)) < Number(this._nextSubtitle.end.toFixed(0))
      ) {
        return this._nextSubtitle.payload
      } else {
        return ''
      }
    } else {
      updateSubtitles()
    }

    function updateSubtitles() {
      // updates current and next subtitle text values
      if (self._captions && self._captions.length) {
        if (
          Number(currentTime.toFixed(0)) <=
          Number(self._captions[self._captions.length - 1].start.toFixed(0))
        ) {
          if (Number(currentTime.toFixed(0)) < Number(self._captions[0].end.toFixed(0))) {
            if (self._captions[1] && self._captions[1].payload) {
              self._nextSubtitle = self._captions[1]
            }
            self._currentSubtitle = self._captions[0]
          } else {
            for (let i = 0; i < self._captions.length; i++) {
              if (Number(self._captions[i].start.toFixed(0)) >= Number(currentTime.toFixed(0))) {
                self._captions[i + 1] && self._captions[i + 1].payload
                  ? (self._nextSubtitle = self._captions[i + 1])
                  : { payload: '' }
                self._currentSubtitle = self._captions[i]
                break
              }
            }
          }
        }
      }
    }
  }

  // parses subtitle file and returns list of time, text objects
  static parseSubtitles(plainSub) {
    let linesArray = plainSub
      .trim()
      .replace('\r\n', '\n')
      .split(/[\r\n]/)
      .map(line => {
        return line.trim()
      })
    let cues = []
    let start = null
    let end = null
    let payload = ''
    let lines = linesArray.filter(item => item !== '' && isNaN(item))
    // linesArray = []
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].indexOf('-->') >= 0) {
        let splitted = lines[i].split(/[ \t]+-->[ \t]+/)

        start = SubtitlesParser.parseTimeStamp(splitted[0])
        end = SubtitlesParser.parseTimeStamp(splitted[1])
      } else if (lines[i] !== '') {
        if (start && end) {
          if (i + 1 < lines.length && lines[i + 1].indexOf('-->') >= 0) {
            let subPayload = payload ? payload + ' ' + lines[i] : lines[i]
            let cue = {
              start,
              end,
              payload: subPayload
                ? this._subtitleTextStyles
                  ? subPayload
                  : subPayload.replace(/<(.*?)>/g, '')
                : '', // Remove <v- >, etc tags in subtitle text
            }
            cues.push(cue)
            start = null
            end = null
            payload = ''
            subPayload = null
          } else {
            payload = payload ? payload + ' ' + lines[i] : lines[i]
          }
        }
      } else if (start && end) {
        if (payload == null) {
          payload = lines[i]
        } else {
          payload += ' ' + lines[i]
        }
      }
    }
    if (start && end) {
      // let match = /<(.*?)>/g
      // if (payload) {
      //   payload.replace(match, '')
      // }
      let cue = {
        start,
        end,
        payload: payload
          ? this._subtitleTextStyles
            ? payload
            : payload.replace(/<(.*?)>/g, '') // Remove <v- >, etc tags in subtitle text
          : '',
      }
      cues.push(cue)
    }
    return cues
  }

  // parses timestamp in subtitle file into seconds
  static parseTimeStamp(s) {
    const match = s.match(/^(?:([0-9]+):)?([0-5][0-9]):([0-5][0-9](?:[.,][0-9]{0,3})?)/)

    const hours = parseInt(match[1], 10) || '0'
    const minutes = parseInt(match[2], 10)
    const seconds = parseFloat(match[3].replace(',', '.'))
    return seconds + 60 * minutes + 60 * 60 * hours
  }
}
