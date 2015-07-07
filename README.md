atom-linter
===========

atom-linter is an npm helper module that you can import in your Linter Providers
and make things easier for yourself.

#### API

```
class Helpers{
  static exec(command: String, args: Array<string> = [], options: Object = {stream: 'stdout'})
  static execFilePath(command: String, args: Array<string> = [], filePath: String, options:Object = {})
  static parse(data: String, regex: String, options: Object = {baseReduction: 1})
}
```

#### License

This project is licensed under the terms of MIT License, see the LICENSE file for more info