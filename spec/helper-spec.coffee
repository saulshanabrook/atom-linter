fs = require 'fs'
helpers = require '../lib/helpers'
testFile = __dirname + '/fixtures/test.txt'
testContents = fs.readFileSync(testFile).toString().trim()
describe 'linter helpers', ->
  describe '::exec', ->
    it 'cries when no argument is passed', ->
      expect ->
        helpers.exec()
      .toThrow()
    it 'works', ->
      waitsForPromise ->
        helpers.exec('cat', [testFile]).then (text) ->
          expect(text).toBe(testContents)
    it 'lets you choose streams', ->
      waitsForPromise ->
        helpers.exec('cat', [testFile], stream: 'stderr').then (text) ->
          expect(text).toBe('')
    it 'accepts stdin', ->
      waitsForPromise ->
        helpers.exec('cat', [], stream: 'stdout', stdin: testContents).then (text) ->
          expect(text).toBe(testContents)
    it "throws if stderr is written to but wasn't expected", ->
      waitsForPromise ->
        helpers.exec(__dirname + '/fixtures/stderr.sh', []).catch (message) ->
          expect(message).toBe("STDERR\n")
  describe '::execNode', ->
    it 'cries when no argument is passed', ->
      expect ->
        helpers.execNode()
      .toThrow()
    it 'works', ->
      waitsForPromise ->
        helpers.execNode(__dirname + '/fixtures/something.js').then (data) ->
          expect(data).toBe('STDOUT')
    it 'lets you choose streams', ->
      waitsForPromise ->
        helpers.execNode(__dirname + '/fixtures/stderr.js', [], {stream: 'stderr'}).then (data) ->
          expect(data).toBe('STDERR')
    it 'accepts stdin', ->
      waitsForPromise ->
        helpers.execNode(__dirname + '/fixtures/something.js', ['input'], {stream: 'stdout', stdin: 'Wow'}).then (data) ->
          expect(data).toBe('STDOUTWow')
    it "throws if stderr is written to but wasn't expected", ->
      waitsForPromise ->
        helpers.execNode(__dirname + '/fixtures/stderr.js', []).catch (message) ->
          expect(message).toBe('STDERR')
  describe '::parse', ->
    it 'cries when no argument is passed', ->
      expect ->
        helpers.parse()
      .toThrow()
    it "cries when data isn't string", ->
      expect ->
        helpers.parse([], '')
      .toThrow("Input must be a string")
    it "works", ->
      regex = 'type:(?<type>.+) message:(?<message>.+)'
      input = 'type:type message:message'
      output = [(
        type: 'type'
        text: 'message'
        filePath: undefined
        range: [[0, 0], [0, 0]]
      )]
      results = helpers.parse(input, regex)
      expect(results).toEqual(output)
  describe '::findFile', ->
    it 'cries wen no argument is passed', ->
      expect ->
        helpers.findFile()
      .toThrow()
    it 'works', ->
      expect(helpers.findFile(__dirname, 'package.json')).toBe(fs.realpathSync(__dirname + '/../package.json'))
