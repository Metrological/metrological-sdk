import { waitFor } from '@testing-library/dom'
import SubtitlesParser from '../src/SubtitlesParser'
import { Log, initLightningSdkPlugin } from '../src/LightningSdkPlugins'
import fs from 'fs'
import { beforeAll, describe, it, jest, test } from '@jest/globals'

let srtData
let srtFileContent
beforeAll(() => {
  return new Promise(resolve => {
    fs.readFile('./tests/inputs/LaLaLand.srt', 'utf8', (err, string) => {
      srtFileContent = string
      srtData = SubtitlesParser.parseSubtitles(string, { removeSubtitleTextStyles: true })
      SubtitlesParser._captions = srtData
      resolve()
    })
  })
})
describe('Subtitles', () => {
  let referenceJsonData
  beforeAll(() => {
    return new Promise(resolve => {
      fs.readFile('./tests/inputs/LaLaLand.srt.json', 'utf8', (err, jsonString) => {
        referenceJsonData = JSON.parse(jsonString)
        resolve()
      })
    })
  })

  // mocking fetch call
  global.fetch = jest.fn(() => {
    return new Promise(resolve => {
      const _srtContent = { text: () => srtFileContent }
      resolve(_srtContent)
    })
  })
  initLightningSdkPlugin.log = {
    info: (input1, input2) => console.log(input1, input2),
    error: (input1, input2) => console.log(input1, input2),
  }
  jest.spyOn(Log, 'info').mockImplementation((input1, input2) => console.log(input1, input2))
  jest.spyOn(Log, 'error').mockImplementation((input1, input2) => console.log(input1, input2))

  it('Check whether reference JSON object is valid', () => {
    expect(referenceJsonData).toBeTruthy()
    expect(Array.isArray(referenceJsonData)).toBe(true)
  })

  it('Check whether .srt file content is valid', () => {
    expect(typeof srtFileContent).toBe('string')
  })

  it('Should through an error on invalid URL', async () => {
    const _fetchInvalidURL = SubtitlesParser.fetchAndParseSubs('h:')
    await waitFor(() => expect(() => _fetchInvalidURL).rejects.toThrowError('Invalid URL'))
  })

  it('should be able to parse subtitles', () => {
    expect(Array.isArray(srtData)).toBe(true)
    expect(srtData).toStrictEqual(referenceJsonData)
  })

  it('should be able to get correct subtitle on currentTime', () => {
    for (let i in referenceJsonData) {
      let _subtitleRefObj = referenceJsonData[i]
      let _currentTime = _subtitleRefObj.start
      let _subtitleText = SubtitlesParser.getSubtitleByTimeIndex(_currentTime)
      expect(_subtitleText).toBe(_subtitleRefObj.payload)
    }
  })

  it('Subtitle should return empty String on outOfBound currentTime', () => {
    let _currentTime = referenceJsonData[referenceJsonData.length - 1].end + 10
    let _subtitleText = SubtitlesParser.getSubtitleByTimeIndex(_currentTime)
    expect(_subtitleText).toBe('')
    _currentTime = referenceJsonData[0].start - 10
    _subtitleText = SubtitlesParser.getSubtitleByTimeIndex(_currentTime)
    expect(_subtitleText).toBe('')
  })

  test('should throw an error on invalid currentTime', () => {
    expect(() => SubtitlesParser.getSubtitleByTimeIndex(undefined)).toThrowError(
      'You should pass a currentTime to fetch the current subtitle'
    )
    expect(() => SubtitlesParser.getSubtitleByTimeIndex('')).toThrowError(
      'You should pass a currentTime to fetch the current subtitle'
    )
  })

  it('Should throw an error if captions are not present', () => {
    SubtitlesParser.clearAllSubtitles()
    expect(() => SubtitlesParser.getSubtitleByTimeIndex(2)).toThrowError(
      "didn't find and stored captions in plugin"
    )
  })
  // experimenting fetch

  it('Should able to fetch and parse subtitles', () => {
    // mocking fetch call
    global.fetch = jest.fn(() => {
      return new Promise(resolve => {
        const _srtContent = { text: () => srtFileContent }
        resolve(_srtContent)
      })
    })
    return SubtitlesParser.fetchAndParseSubs(
      'https://github.com/mlapps/com.metrological.app.Videoland/blob/master/src/lib/vtt.js' // dummy URL
    ).then(res => {
      expect(res).toStrictEqual(referenceJsonData)
    })
  })

  it('Should able to fetch and parse without removing SubtitleTextStyles', () => {
    return SubtitlesParser.fetchAndParseSubs(
      'https://github.com/mlapps/com.metrological.app.Videoland/blob/master/src/lib/vtt.js', // Dummy URL
      null,
      { removeSubtitleTextStyles: false }
    ).then(res => {
      expect(res[5].payload).toBe('<i>Ba-ba-da ba-da ba-da-ba-ba</i>')
    })
  })

  it('Should able to fetch and parse with removing SubtitleTextStyles', () => {
    return SubtitlesParser.fetchAndParseSubs(
      'https://github.com/mlapps/com.metrological.app.Videoland/blob/master/src/lib/vtt.js', // Dummy URL
      null,
      { removeSubtitleTextStyles: true }
    ).then(res => {
      expect(res[5].payload).toBe('Ba-ba-da ba-da ba-da-ba-ba')
    })
  })

  it('Should able to fetch and parse using custom parser', () => {
    const abcParser = () => {
      return referenceJsonData
    }

    return SubtitlesParser.fetchAndParseSubs(
      'https://github.com/mlapps/com.metrological.app.Videoland/blob/master/src/lib/vtt.js', // Dummy URL
      abcParser,
      { removeSubtitleTextStyles: true }
    ).then(res => {
      expect(res[5].payload).toBe('Ba-ba-da ba-da ba-da-ba-ba')
    })
  })
  it('should through error on custom parser failed to parse captions', async () => {
    const abcParser = () => {
      return ''
    }
    const _fetchSubs = SubtitlesParser.fetchAndParseSubs(
      'https://github.com/mlapps/com.metrological.app.Videoland/blob/master/src/lib/vtt.js', // Dummy URL
      abcParser,
      { removeSubtitleTextStyles: true }
    )
    await waitFor(() =>
      expect(_fetchSubs).rejects.toBe('Failed to parse subtitles: invalid subtitles length')
    )
  })
})
