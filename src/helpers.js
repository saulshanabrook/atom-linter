'use babel'

/* @flow */

import FS from 'fs'
import Temp from 'tmp'
import promisify from 'sb-promisify'
import type { TextEditor } from 'atom'
import type { TempDirectory } from './types'

export const writeFile = promisify(FS.writeFile)
export const unlinkFile = promisify(FS.unlink)
export const assign = Object.assign || function (target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key]
    }
  }
  return target
}

export function getTempDirectory(prefix: string): Promise<TempDirectory> {
  return new Promise(function (resolve, reject) {
    Temp.dir({ prefix }, function (error, directory, cleanup) {
      if (error) {
        reject(error)
      } else resolve({ path: directory, cleanup })
    })
  })
}

export function fileExists(filePath: string): Promise<boolean> {
  return new Promise(function (resolve) {
    FS.access(filePath, FS.R_OK, function (error) {
      resolve(error === null)
    })
  })
}

export function validateExec(command: string, args: Array<string>, options: Object) {
  if (typeof command !== 'string') {
    throw new Error('Invalid or no `command` provided')
  } else if (!(args instanceof Array)) {
    throw new Error('Invalid or no `args` provided')
  } else if (typeof options !== 'object') {
    throw new Error('Invalid or no `options` provided')
  }
}

export function validateEditor(editor: TextEditor) {
  let isEditor
  if (typeof atom.workspace.isTextEditor === 'function') {
    // Added in Atom v1.4.0
    isEditor = atom.workspace.isTextEditor(editor)
  } else {
    isEditor = typeof editor.getText === 'function'
  }
  if (!isEditor) {
    throw new Error('Invalid TextEditor provided')
  }
}

export function validateFind(directory: string, name: string | Array<string>) {
  if (typeof directory !== 'string') {
    throw new Error('Invalid or no `directory` provided')
  } else if (typeof name !== 'string' && !(name instanceof Array)) {
    throw new Error('Invalid or no `name` provided')
  }
}
