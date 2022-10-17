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

export default class SubtitleAsset {
  constructor(obj) {
    this._start = obj.start // start time to show subtitle in sec
    this._end = obj.end // end time of showing subtitle in sec
    this._payload = obj.payload ? obj.payload.replace(/<(.*?)>/g, '') : '' // Remove <v- >, etc tags in subtitle text
  }

  get start() {
    return this._start
  }

  get end() {
    return this._end
  }

  get payload() {
    return this._payload
  }
}
