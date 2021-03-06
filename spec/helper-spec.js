'use babel'

import * as fs from 'fs'
import * as path from 'path'
import { waitsForAsync, waitsForAsyncRejection } from './spec-helpers'
const helpersOfHelpers = require('../src/helpers')
const helpers = require('../src/index')

const mixedIndentFile = path.join(__dirname, 'fixtures', 'mixedIndent.txt')
const somethingFile = path.join(__dirname, 'fixtures', 'something.js')
const packageJsonPath = fs.realpathSync(`${__dirname}/../package.json`)

describe('linter helpers', function () {
  describe('::rangeFromLineNumber', function () {
    it('cries when invalid textEditor is passed', () =>
      expect(() =>
        helpers.rangeFromLineNumber()
      ).toThrow()
    )

    it('returns a range pointing at file start if no or invalid line is provided', () =>
      waitsForAsync(async function () {
        await atom.workspace.open(somethingFile)
        const textEditor = atom.workspace.getActiveTextEditor()
        expect(helpers.rangeFromLineNumber(textEditor)).toEqual([[0, 0], [0, 30]])
        expect(helpers.rangeFromLineNumber(textEditor, -1)).toEqual([[0, 0], [0, 30]])
        expect(helpers.rangeFromLineNumber(textEditor, 'a')).toEqual([[0, 0], [0, 30]])
      })
    )

    it('ignores an invalid starting column', () =>
      waitsForAsync(async function () {
        await atom.workspace.open(somethingFile)
        const textEditor = atom.workspace.getActiveTextEditor()
        expect(helpers.rangeFromLineNumber(textEditor, 7, -1)).toEqual([[7, 0], [7, 43]])
        expect(helpers.rangeFromLineNumber(textEditor, 7, 'a')).toEqual([[7, 0], [7, 43]])
      })
    )

    it('returns a range (array) with some valid points', () =>
      waitsForAsync(async function () {
        await atom.workspace.open(somethingFile)
        const textEditor = atom.workspace.getActiveTextEditor()
        const range = helpers.rangeFromLineNumber(textEditor, 7)
        expect(range instanceof Array).toBe(true)
        expect(range[0] instanceof Array).toBe(true)
        expect(range[1] instanceof Array).toBe(true)
        expect(range[0][0]).toEqual(7)
        expect(range[0][1]).toEqual(0)
        expect(range[1][0]).toEqual(7)
        expect(range[1][1]).toEqual(43)
      })
    )

    it('returns a range (array) with some valid points and provided colStart', () =>
      waitsForAsync(async function () {
        await atom.workspace.open(somethingFile)
        const textEditor = atom.workspace.getActiveTextEditor()
        const range = helpers.rangeFromLineNumber(textEditor, 7, 4)
        expect(range instanceof Array).toBe(true)
        expect(range[0] instanceof Array).toBe(true)
        expect(range[1] instanceof Array).toBe(true)
        expect(range[0][0]).toEqual(7)
        expect(range[0][1]).toEqual(4)
        expect(range[1][0]).toEqual(7)
        expect(range[1][1]).toEqual(43)
      })
    )

    it('cries when colStart is greater than line length', () =>
      waitsForAsync(async function () {
        await atom.workspace.open(somethingFile)
        const textEditor = atom.workspace.getActiveTextEditor()
        return expect(() =>
          helpers.rangeFromLineNumber(textEditor, 7, 50)
        ).toThrow()
      })
    )

    it('cries when lineNumber is greater than the maximum line', () =>
      waitsForAsync(async function () {
        await atom.workspace.open(somethingFile)
        const textEditor = atom.workspace.getActiveTextEditor()
        return expect(() =>
          helpers.rangeFromLineNumber(textEditor, 11)
        ).toThrow()
      })
    )

    it('handles files with mixed intentation', () =>
      waitsForAsync(async function () {
        await atom.workspace.open(mixedIndentFile)
        const textEditor = atom.workspace.getActiveTextEditor()
        expect(helpers.rangeFromLineNumber(textEditor, 0)).toEqual([[0, 0], [0, 3]])
        expect(helpers.rangeFromLineNumber(textEditor, 1)).toEqual([[1, 2], [1, 5]])
        expect(helpers.rangeFromLineNumber(textEditor, 2)).toEqual([[2, 1], [2, 4]])
        return expect(helpers.rangeFromLineNumber(textEditor, 3)).toEqual([[3, 2], [3, 5]])
      })
    )
  })

  describe('::parse', function () {
    it('cries when no argument is passed', () =>
      expect(() => helpers.parse()).toThrow()
    )

    it("cries when data isn't string", () =>
      expect(() => helpers.parse([], '')).toThrow()
    )

    it('works', function () {
      let regex = 'type:(?<type>.+) message:(?<message>.+)'
      let input = 'TYPE:type message:message'
      let output = [
        {
          type: 'type',
          text: 'message',
          filePath: null,
          range: [[0, 0], [0, 0]]
        }
      ]
      let results = helpers.parse(input, regex, { flags: 'i' })
      expect(results).toEqual(output)

      regex = 'type:(?<type>.+) message:(?<message>.+)'
      input = 'TYPE:type message:message'
      output = [
        {
          type: 'type',
          text: 'message',
          filePath: null,
          range: [[0, 0], [0, 0]]
        }
      ]
      results = helpers.parse(input, regex, { flags: 'gi' })
      expect(results).toEqual(output)
    })
  })

  describe('::find', function () {
    it('cries when no argument is passed', () =>
      expect(() => helpers.find()).toThrow()
    )

    it('works', function () {
      expect(helpers.find(__dirname, 'package.json')).
        toBe(packageJsonPath)
      expect(helpers.findCached(__dirname, 'package.json')).
        toBe(packageJsonPath)
    })

    it('returns null if no file is found', function () {
      expect(helpers.find('/a/path/that/does/not/exist', '.gitignore')).toBe(null)
      expect(helpers.findCached('/a/path/that/does/not/exist', '.gitignore')).toBe(null)
    })
  })

  describe('::findAsync', function () {
    it('cries when no argument is passed', () =>
      waitsForAsyncRejection(async function () {
        return await helpers.findAsync()
      })
    )

    it('works', function () {
      waitsForAsync(async function () {
        return await helpers.findAsync(__dirname, 'package.json')
      }, packageJsonPath)
      waitsForAsync(async function () {
        return await helpers.findCachedAsync(__dirname, 'package.json')
      }, packageJsonPath)
    })

    it('returns null if no file is found', function () {
      waitsForAsync(async function () {
        return await helpers.findAsync(__dirname, '.ucompilerrc')
      }, null)
      waitsForAsync(async function () {
        return await helpers.findCachedAsync(__dirname, '.ucompilerrc')
      }, null)
    })
  })

  describe('::tempFile', function () {
    it('cries when arguments are invalid', function () {
      expect(() => helpers.tempFile()).toThrow()
      expect(() => helpers.tempFile(null, null, null)).toThrow()
      expect(() => helpers.tempFile('', null, null)).toThrow()
      expect(() => helpers.tempFile('', '', null)).toThrow()
      expect(() => helpers.tempFile('', '', '')).toThrow()
    })

    it('works and accepts a callback and returns a promise and its promise' +
      ' value is that returned by the callback', () =>
      waitsForAsync(async () =>
        await helpers.tempFile('somefile.js', 'Hey There', filepath => {
          expect(filepath.indexOf('atom-linter_')).not.toBe(-1)
          expect(path.basename(filepath)).toBe('somefile.js')
          expect(fs.existsSync(filepath)).toBe(true)
          expect(fs.readFileSync(filepath).toString()).toBe('Hey There')
          return 1
        })
      , 1)
    )
  })

  describe('::tempFiles', function () {
    it('cries when arguments are invalid', function () {
      waitsForAsyncRejection(async function () {
        await helpers.tempFiles()
      })
      waitsForAsyncRejection(async function () {
        await helpers.tempFiles(null, null)
      })
      waitsForAsyncRejection(async function () {
        await helpers.tempFiles('', null)
      })
      waitsForAsyncRejection(async function () {
        await helpers.tempFiles('', '')
      })
      waitsForAsyncRejection(async function () {
        await helpers.tempFiles(null, '')
      })
      waitsForAsyncRejection(async function () {
        await helpers.tempFiles([], '')
      })
      waitsForAsyncRejection(async function () {
        await helpers.tempFiles([], null)
      })
      waitsForAsync(async function () {
        return await helpers.tempFiles([], function (files) {
          expect(files).toEqual([])
          return 50
        })
      }, 50)
    })

    it('works and accepts a callback and returns a promise and its promise ' +
      'value is that returned by the callback', () =>
      waitsForAsync(async () =>
        await helpers.tempFiles([
          { name: 'foo.js', contents: 'Foo!' },
          { name: 'bar.js', contents: 'Bar!' }
        ], filepaths => {
          expect(filepaths[0].indexOf('atom-linter_')).not.toBe(-1)
          expect(path.basename(filepaths[0])).toBe('foo.js')
          expect(fs.existsSync(filepaths[0])).toBe(true)
          expect(fs.readFileSync(filepaths[0]).toString()).toBe('Foo!')
          expect(filepaths[1].indexOf('atom-linter_')).not.toBe(-1)
          expect(path.basename(filepaths[1])).toBe('bar.js')
          expect(fs.existsSync(filepaths[1])).toBe(true)
          expect(fs.readFileSync(filepaths[1]).toString()).toBe('Bar!')
          return filepaths
        }).then(result => expect(result.length).toBe(2))
      )
    )
  })
  describe('validateEditor', function () {
    it('works if there\'s atom.workspace.isTextEditor', function () {
      waitsForAsync(async function () {
        await atom.workspace.open(somethingFile)
        const textEditor = atom.workspace.getActiveTextEditor()
        expect(function () {
          helpersOfHelpers.validateEditor(textEditor)
        }).not.toThrow()
        expect(function () {
          helpersOfHelpers.validateEditor(null)
        }).toThrow()
        expect(function () {
          helpersOfHelpers.validateEditor(false)
        }).toThrow()
      })
    })
    it('works if there isnt atom.workspace.isTextEditor', function () {
      waitsForAsync(async function () {
        const _ = atom.workspace.isTextEditor
        atom.workspace.isTextEditor = null

        await atom.workspace.open(somethingFile)
        const textEditor = atom.workspace.getActiveTextEditor()
        expect(function () {
          helpersOfHelpers.validateEditor(textEditor)
        }).not.toThrow()
        expect(function () {
          helpersOfHelpers.validateEditor(null)
        }).toThrow()
        expect(function () {
          helpersOfHelpers.validateEditor(false)
        }).toThrow()

        atom.workspace.isTextEditor = _
      })
    })
  })
})
