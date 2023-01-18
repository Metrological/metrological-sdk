import { waitFor } from '@testing-library/dom'
import SubtitlesParser from '../src/SubtitlesParser'
import { Log, initLightningSdkPlugin } from '../src/LightningSdkPlugins'

let srtFileContent = `1
00:00:00,001 --> 00:00:05,000
We'd sink into our seats
right as they dimmed out all the lights

2
00:00:25,801 --> 00:00:28,700
It's another hot, sunny day today
here in Southern California.

3
00:00:28,801 --> 00:00:30,900
Temperature is 84?F
for downtown Los Angeles.

4
00:00:30,901 --> 00:00:33,000
Overnight lows of 75. [...]

5
00:01:05,401 --> 00:01:07,300
<i>We were seventeen,
  but he was sweet and it was true</i>`
let vttFileContent = `
WEBVTT

1
00:00:00.001 --> 00:00:05.000
We'd sink into our seats
right as they dimmed out all the lights

2
00:00:25.801 --> 00:00:28.700
It's another hot, sunny day today
here in Southern California.

3
00:00:28.801 --> 00:00:30.900
Temperature is 84?F
for downtown Los Angeles.

4
00:00:30.901 --> 00:00:33.000
Overnight lows of 75. [...]

5
00:01:05.401 --> 00:01:07.300
<i>We were seventeen,
  but he was sweet and it was true</i>`
let referenceJsonData = [
  {
    start: 0.001,
    end: 5,
    payload: "We'd sink into our seats\nright as they dimmed out all the lights",
  },
  {
    start: 25.801,
    end: 28.7,
    payload: "It's another hot, sunny day today\nhere in Southern California.",
  },
  {
    start: 28.801,
    end: 30.9,
    payload: 'Temperature is 84?F\nfor downtown Los Angeles.',
  },
  {
    start: 30.901,
    end: 33,
    payload: 'Overnight lows of 75. [...]',
  },
  {
    start: 65.401,
    end: 67.3,
    payload: 'We were seventeen,\nbut he was sweet and it was true',
  },
]
// mocking fetch call
global.fetch = jest.fn(() => {
  return new Promise(resolve => {
    const _srtContent = { text: () => srtFileContent }
    resolve(_srtContent)
  })
})
initLightningSdkPlugin.log = {
  info: (input1, input2) => console.log(input1, input2),
  error: (input1, input2) => console.error(input1, input2),
  warn: (input1, input2) => console.warn(input1, input2),
}
jest.spyOn(Log, 'info').mockImplementation((input1, input2) => console.log(input1, input2))
jest.spyOn(Log, 'warn').mockImplementation((input1, input2) => console.warn(input1, input2))
jest.spyOn(Log, 'error').mockImplementation((input1, input2) => console.error(input1, input2))

describe('fetchAndParseSubs', () => {
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

  it('Should through an error on invalid subtitle URL', async () => {
    const _fetchInvalidURL = SubtitlesParser.fetchAndParseSubs('bla')
    await waitFor(() => expect(() => _fetchInvalidURL).rejects.toThrowError('Invalid URL'))
  })

  it('Should able to fetch and parse subtitles', () => {
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
      expect(res[4].payload).toBe('<i>We were seventeen,\nbut he was sweet and it was true</i>')
    })
  })

  it('Should able to fetch and parse with removing SubtitleTextStyles', () => {
    return SubtitlesParser.fetchAndParseSubs(
      'https://github.com/mlapps/com.metrological.app.Videoland/blob/master/src/lib/vtt.js', // Dummy URL
      null,
      { removeSubtitleTextStyles: true }
    ).then(res => {
      expect(res[4].payload).toBe('We were seventeen,\nbut he was sweet and it was true')
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
      expect(res[4].payload).toBe('We were seventeen,\nbut he was sweet and it was true')
    })
  })

  it('Do nothing if no cues in parsed subtitles', async () => {
    const abcParser = () => {
      return []
    }
    const _fetchSubs = SubtitlesParser.fetchAndParseSubs(
      'https://github.com/mlapps/com.metrological.app.Videoland/blob/master/src/lib/vtt.js', // Dummy URL
      abcParser,
      { removeSubtitleTextStyles: true }
    )
    await waitFor(() => expect(_fetchSubs).resolves.toStrictEqual([]))
  })
})

describe('getSubtitleByTimeIndex', () => {
  beforeAll(() => {
    return SubtitlesParser.fetchAndParseSubs(
      'https://github.com/mlapps/com.metrological.app.Videoland/blob/master/src/lib/vtt.js', // Dummy URL
      null,
      { removeSubtitleTextStyles: true }
    )
  })
  it('Subtitle should return empty String on outOfBound currentTime', () => {
    let _currentTime = referenceJsonData[referenceJsonData.length - 1].end + 10
    let _subtitleText = SubtitlesParser.getSubtitleByTimeIndex(_currentTime)
    expect(_subtitleText).toBe('')
    _currentTime = referenceJsonData[0].start - 10
    _subtitleText = SubtitlesParser.getSubtitleByTimeIndex(_currentTime)
    expect(_subtitleText).toBe('')
  })

  it('should throw an error on invalid currentTime', () => {
    expect(() => SubtitlesParser.getSubtitleByTimeIndex(undefined)).toThrowError(
      'You should pass "currentTime" as a number'
    )
    expect(() => SubtitlesParser.getSubtitleByTimeIndex('')).toThrowError(
      'You should pass "currentTime" as a number'
    )
  })

  it('should be able to get correct subtitle on currentTime', () => {
    for (let i in referenceJsonData) {
      let _subtitleRefObj = referenceJsonData[i]
      let _currentTime = _subtitleRefObj.start
      let _subtitleText = SubtitlesParser.getSubtitleByTimeIndex(_currentTime)
      expect(_subtitleText).toBe(_subtitleRefObj.payload)
    }
  })
})

describe('clearAllSubtitles', () => {
  beforeAll(() => {
    return SubtitlesParser.fetchAndParseSubs(
      'https://github.com/mlapps/com.metrological.app.Videoland/blob/master/src/lib/vtt.js', // Dummy URL
      null,
      { removeSubtitleTextStyles: true }
    )
  })

  it('should clear all subtitles data on clearAllSubtitles()', () => {
    SubtitlesParser.clearAllSubtitles()
    expect(SubtitlesParser._captions.length).toStrictEqual(0)
    expect(SubtitlesParser._lastIndex).toStrictEqual(0)
    // expect(SubtitlesParser._previousCueTimeIndex).toStrictEqual(0)
    expect(SubtitlesParser._previousCue).toStrictEqual('')
  })
  it('Should throw an error on getSubtitleByTimeIndex()', () => {
    SubtitlesParser.clearAllSubtitles()
    expect(() => SubtitlesParser.getSubtitleByTimeIndex(2)).toThrowError('No subtitles available')
  })
})

describe('getActiveIndex', () => {
  beforeAll(() => {
    return SubtitlesParser.fetchAndParseSubs(
      'https://github.com/mlapps/com.metrological.app.Videoland/blob/master/src/lib/vtt.js', // Dummy URL
      null,
      { removeSubtitleTextStyles: true }
    )
  })

  it('Should return valid active index on currentTime', () => {
    expect(SubtitlesParser.getActiveIndex(2)).toStrictEqual(0)
    expect(SubtitlesParser.getActiveIndex(32)).toStrictEqual(3)
    expect(SubtitlesParser.getActiveIndex(26)).toStrictEqual(1)
    expect(SubtitlesParser.getActiveIndex(66)).toStrictEqual(4)
    SubtitlesParser._lastIndex = 4
    expect(SubtitlesParser.getActiveIndex(2)).toStrictEqual(0)
    expect(SubtitlesParser.getActiveIndex(-1)).toStrictEqual(-1)
  })

  // it('Should not call getActiveIndex when called with in 0.5s', () => {
  //   jest.spyOn(SubtitlesParser, 'getActiveIndex').mockImplementation(() => 1)
  //   SubtitlesParser.getSubtitleByTimeIndex(4)
  //   SubtitlesParser.getSubtitleByTimeIndex(4.4)
  //   expect(SubtitlesParser.getActiveIndex).toBeCalledTimes(1)
  //   SubtitlesParser.getSubtitleByTimeIndex(4.6)
  //   expect(SubtitlesParser.getActiveIndex).toBeCalledTimes(2)
  //   SubtitlesParser.getActiveIndex.mockRestore()
  // })
})

describe('parseSubtitles', () => {
  it('Should able to parse a .srt file format', () => {
    expect(
      SubtitlesParser.parseSubtitles(srtFileContent, { removeSubtitleTextStyles: true })
    ).toStrictEqual(referenceJsonData)
    let _parsedCaptions = SubtitlesParser.parseSubtitles(srtFileContent, {
      removeSubtitleTextStyles: false,
    })
    expect(_parsedCaptions[4].payload).toStrictEqual(
      '<i>We were seventeen,\nbut he was sweet and it was true</i>'
    )
  })
  it('Should able to parse a .vtt file format', () => {
    expect(
      SubtitlesParser.parseSubtitles(vttFileContent, { removeSubtitleTextStyles: true })
    ).toStrictEqual(referenceJsonData)
    let _parsedCaptions = SubtitlesParser.parseSubtitles(vttFileContent, {
      removeSubtitleTextStyles: false,
    })
    expect(_parsedCaptions[4].payload).toStrictEqual(
      '<i>We were seventeen,\nbut he was sweet and it was true</i>'
    )
  })
})

describe('parseTimeStamp', () => {
  it('should able to parsed .srt/.vtt timestamp', () => {
    expect(SubtitlesParser.parseTimeStamp('00:00:28,801')).toStrictEqual(28.801)
    expect(SubtitlesParser.parseTimeStamp('00:01:14,28')).toStrictEqual(74.28)
    expect(SubtitlesParser.parseTimeStamp('20:10:32.254')).toStrictEqual(72632.254)
  })
})
