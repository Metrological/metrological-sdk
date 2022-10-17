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

import SubtitleAsset from './SubtitleAsset.js'
export default class Subtitles {
  // @ params url: subtitle file URL
  // @return parsed subtitles as list of objects
  // also stores parsed data
  static fetchAndParseSubs(url) {
    return fetch(url)
      .then(data => data.text())
      .then(subtitleData => {
        this.clearCurrentSubtitle()
        return this.parseSubtitles(subtitleData)
      })
  }

  // clears stored subtitles data
  static clearCurrentSubtitle() {
    this._currentSubtitle = null
    this._nextSubtitle = null
  }

  // @params timeIndex: time as seconds
  // @return subtitle as text at passed timeIndex
  static getSubtitleByTimeIndex(timeIndex) {
    let self = this
    if (
      this._captions &&
      this._captions.length &&
      this._currentSubtitle &&
      this._nextSubtitle &&
      Number(timeIndex.toFixed(0)) < Number(this._nextSubtitle.end.toFixed(0)) &&
      Number(timeIndex.toFixed(0)) >= Number(this._currentSubtitle.start.toFixed(0))
    ) {
      if (
        Number(timeIndex.toFixed(0)) >= Number(this._currentSubtitle.start.toFixed(0)) &&
        Number(timeIndex.toFixed(0)) < Number(this._currentSubtitle.end.toFixed(0))
      ) {
        return this._currentSubtitle.payload
      } else if (
        Number(timeIndex.toFixed(0)) >= Number(this._nextSubtitle.start.toFixed(0)) &&
        Number(timeIndex.toFixed(0)) < Number(this._nextSubtitle.end.toFixed(0))
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
          Number(timeIndex.toFixed(0)) <=
          Number(self._captions[self._captions.length - 1].start.toFixed(0))
        ) {
          if (Number(timeIndex.toFixed(0)) < Number(self._captions[0].end.toFixed(0))) {
            if (self._captions[1] && self._captions[1].payload) {
              self._nextSubtitle = self._captions[1]
            }
            self._currentSubtitle = self._captions[0]
          } else {
            for (let i = 0; i < self._captions.length; i++) {
              if (Number(self._captions[i].start.toFixed(0)) >= Number(timeIndex.toFixed(0))) {
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
    let payload = null
    let lines = linesArray.filter(item => item !== '' && isNaN(item))
    linesArray = []
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].indexOf('-->') >= 0) {
        let splitted = lines[i].split(/[ \t]+-->[ \t]+/)

        start = Subtitles.parseTimeStamp(splitted[0])
        end = Subtitles.parseTimeStamp(splitted[1])
      } else if (lines[i] !== '') {
        if (start && end) {
          if (i + 1 < lines.length && lines[i + 1].indexOf('-->') >= 0) {
            let cue = new SubtitleAsset({
              start,
              end,
              payload: payload ? payload + ' ' + lines[i] : lines[i],
            })
            cues.push(cue)
            start = null
            end = null
            payload = null
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
      let match = /<(.*?)>/g
      if (payload) {
        payload.replace(match, '')
      }
      let cue = new SubtitleAsset({ start, end, payload })
      cues.push(cue)
    }
    this._captions = cues
    return this._captions
  }

  // parses timestamp in subtitle file into seconds
  static parseTimeStamp(s) {
    let match = s.match(/^(?:([0-9]+):)?([0-5][0-9]):([0-5][0-9](?:[.,][0-9]{0,3})?)/)

    let hours = parseInt(match[1] || '0', 10)
    let minutes = parseInt(match[2], 10)
    let seconds = parseFloat(match[3].replace(',', '.'))
    return seconds + 60 * minutes + 60 * 60 * hours
  }
}
