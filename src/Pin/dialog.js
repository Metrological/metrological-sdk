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

import { Lightning } from '../LightningSdkPlugins'
import Pin from '../Pin'

const PinInput = () => {
  return class PinInput extends Lightning.Component {
    static _template() {
      return {
        w: 120,
        h: 150,
        rect: true,
        color: 0xff949393,
        alpha: 0.5,
        shader: { type: Lightning.shaders.RoundedRectangle, radius: 10 },
        Nr: {
          w: w => w,
          y: 24,
          text: {
            text: '',
            textColor: 0xff333333,
            fontSize: 80,
            textAlign: 'center',
            verticalAlign: 'middle',
          },
        },
      }
    }

    set index(v) {
      this.x = v * (120 + 24)
    }

    set nr(v) {
      this._timeout && clearTimeout(this._timeout)

      if (v) {
        this.setSmooth('alpha', 1)
      } else {
        this.setSmooth('alpha', 0.5)
      }

      this.tag('Nr').patch({
        text: {
          text: (v && v.toString()) || '',
          fontSize: v === '*' ? 120 : 80,
        },
      })

      if (v && v !== '*') {
        this._timeout = setTimeout(() => {
          this._timeout = null
          this.nr = '*'
        }, 750)
      }
    }
  }
}

export default () => {
  return class PinDialog extends Lightning.Component {
    static _template() {
      return {
        zIndex: 1,
        w: w => w,
        h: h => h,
        rect: true,
        color: 0xdd000000,
        alpha: 0.000001,
        Dialog: {
          w: 648,
          h: 360,
          y: h => (h - 320) / 2,
          x: w => (w - 648) / 2,
          rect: true,
          color: 0xdd333333,
          shader: { type: Lightning.shaders.RoundedRectangle, radius: 10 },
          Info: {
            y: 24,
            x: 48,
            text: { text: 'Please enter your PIN', fontSize: 32 },
          },
          Msg: {
            y: 300,
            x: w => w / 2,
            mount: 0.5,
            text: {
              text: '',
              fontSize: 28,
              textColor: 0xffffffff,
              textAlign: 'center',
              verticalAlign: 'middle',
            },
          },
          Code: {
            x: 48,
            y: 96,
          },
          OkButton: {
            w: 260,
            h: 75,
            y: 266,
            x: w => w / 2,
            mountX: 0.5,
            rect: true,
            color: 0xffffffff,
            shader: { type: Lightning.shaders.RoundedRectangle, radius: 10 },
            Label: {
              x: 130,
              y: 40,
              mount: 0.5,
              text: {
                text: 'OK',
                textColor: 0xff333333,
                fontSize: 40,
                textAlign: 'center',
                verticalAlign: 'middle',
              },
            },
          },
        },
      }
    }

    _init() {
      const children = []
      for (let i = 0; i < 4; i++) {
        children.push({
          type: PinInput(),
          index: i,
        })
      }

      this.tag('Code').children = children
    }

    get pin() {
      if (!this._pin) this._pin = ''
      return this._pin
    }

    set pin(v) {
      if (v.length <= 4) {
        const maskedPin = new Array(Math.max(v.length - 1, 0)).fill('*', 0, v.length - 1)
        v.length && maskedPin.push(v.length > this._pin.length ? v.slice(-1) : '*')
        for (let i = 0; i < 4; i++) {
          this.tag('Code').children[i].nr = maskedPin[i] || ''
        }
        this._pin = v
      }
    }

    get msg() {
      if (!this._msg) this._msg = ''
      return this._msg
    }

    set msg(v) {
      this._timeout && clearTimeout(this._timeout)

      this._msg = v
      if (this._msg) {
        this.tag('Msg').text = this._msg
        this.tag('Info').setSmooth('alpha', 0.5)
        this.tag('Code').setSmooth('alpha', 0.5)
        this.tag('OkButton').setSmooth('alpha', 0)
      } else {
        this.tag('Msg').text = ''
        this.tag('Info').setSmooth('alpha', 1)
        this.tag('Code').setSmooth('alpha', 1)
        this.tag('OkButton').setSmooth('alpha', 1)
      }
      this._timeout = setTimeout(() => {
        this.msg = ''
        this.tag('OkButton').setSmooth('alpha', 1)
      }, 2000)
    }

    _firstActive() {
      this.setSmooth('alpha', 1)
    }

    _getDigit(event) {
      const keyCodes = {
        '48': 0,
        '49': 1,
        '50': 2,
        '51': 3,
        '52': 4,
        '53': 5,
        '54': 6,
        '55': 7,
        '56': 8,
        '57': 9,
      }
      if (event && event.key) {
        return parseInt(event.key)
      } else {
        let keyCode = event.which ? event.which : event.keyCode
        return keyCodes[keyCode] || keyCodes[keyCode] === 0 ? keyCodes[keyCode] : -1
      }
    }

    _handleKey(event) {
      const digit = this._getDigit(event)
      if (this.msg) {
        this.msg = false
      } else {
        if (digit > -1) {
          this.pin += digit
        }
      }
    }

    _handleBack(event) {
      event.preventDefault()
      event.stopPropagation()
      if (this.msg) {
        this.msg = false
      } else {
        if (this.pin.length) {
          this.pin = this.pin.slice(0, this.pin.length - 1)
        } else {
          Pin.hide()
          this.resolve(false)
        }
      }
    }

    _handleEnter() {
      if (this.msg) {
        this.msg = false
      } else {
        Pin.submit(this.pin)
          .then(val => {
            this.msg = 'Unlocking ...'
            setTimeout(() => {
              Pin.hide()
            }, 1000)
            this.resolve(val)
          })
          .catch(e => {
            this.msg = e
            this.pin = ''
            this.reject(e)
          })
      }
    }
  }
}
