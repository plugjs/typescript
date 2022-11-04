import ts from 'typescript' // TypeScript does NOT support ESM modules
import { expect } from 'chai'
import { resolve } from '@plugjs/plug'

import { getCompilerOptions } from '../src/options'

describe('TypeScript Compiler Options', () => {
  it('should return the default options or fail', async () => {
    let { options, errors } = await getCompilerOptions()
    expect(options).to.eql(ts.getDefaultCompilerOptions())
    expect(errors.length).to.eql(0)


    ;({ options, errors } = await getCompilerOptions(resolve('@/foobar.json')))
    expect(options).to.eql({})
    expect(errors.length).to.equal(1)
    expect(errors[0].code).to.equal(5083)
    expect(errors[0].messageText).to.match(/foobar\.json/)
    expect(errors[0].category).to.equal(ts.DiagnosticCategory.Error)
  })

  it('should read a basic configuration file', async () => {
    const base = resolve('@/options/base.json')
    let { options, errors } = await getCompilerOptions(base)
    expect(errors.length).to.eql(0)
    expect(options).to.eql(Object.assign({}, ts.getDefaultCompilerOptions(), {
      configFilePath: base,
      module: ts.ModuleKind.CommonJS,
    }))


    const wrong = resolve('@/options/wrong.json')
    ;({ options, errors } = await getCompilerOptions(wrong))
    expect(options).to.eql({})
    expect(errors.length).to.equal(1)
    expect(errors[0].code).to.equal(6046)
    expect(errors[0].messageText).to.match(/module/)
    expect(errors[0].category).to.equal(ts.DiagnosticCategory.Error)
  })

  it('should read an extended configuration file', async () => {
    // base file
    const base = resolve('@/options/base/tsconfig.json')
    let { options, errors } = await getCompilerOptions(base)
    expect(errors.length).to.eql(0)
    expect(options).to.eql(Object.assign(ts.getDefaultCompilerOptions(), {
      module: ts.ModuleKind.AMD,
      configFilePath: base,
      outDir: resolve('@/options/base/outDir'),
      rootDir: resolve('@/options/base/rootDir'),
      declarationDir: resolve('@/options/base/declarationDir'),
      rootDirs: [
        resolve('@/options/base/rootDirs/1'),
        resolve('@/options/base/rootDirs/2'),
      ],
      outFile: resolve('@/options/base/outDile.js'),
    }))

    // extended file (overrides module, preserves paths)
    const ext = resolve('@/options/ext/tsconfig.json')
    ;({ options, errors } = await getCompilerOptions(ext))
    expect(errors.length).to.eql(0)
    expect(options).to.eql(Object.assign(ts.getDefaultCompilerOptions(), {
      module: ts.ModuleKind.CommonJS,
      configFilePath: ext,
      outDir: resolve('@/options/base/outDir'),
      rootDir: resolve('@/options/base/rootDir'),
      declarationDir: resolve('@/options/base/declarationDir'),
      rootDirs: [
        resolve('@/options/base/rootDirs/1'),
        resolve('@/options/base/rootDirs/2'),
      ],
      outFile: resolve('@/options/base/outDile.js'),
    }))

    // extended file with manual overrides
    ;({ options, errors } = await getCompilerOptions(ext, {
      module: ts.ModuleKind.AMD,
    }))

    expect(errors.length).to.eql(0)
    expect(options).to.eql(Object.assign(ts.getDefaultCompilerOptions(), {
      module: ts.ModuleKind.AMD,
      configFilePath: ext,
      outDir: resolve('@/options/base/outDir'),
      rootDir: resolve('@/options/base/rootDir'),
      declarationDir: resolve('@/options/base/declarationDir'),
      rootDirs: [
        resolve('@/options/base/rootDirs/1'),
        resolve('@/options/base/rootDirs/2'),
      ],
      outFile: resolve('@/options/base/outDile.js'),
    }))
  })

  it('should detect circular dependencies when reading extended configurations', async () => {
    const base = resolve('@/options/circular/tsconfig.json')
    const { options, errors } = await getCompilerOptions(base)
    expect(options).to.eql({})
    expect(errors.length).to.eql(1)
    expect(errors[0].code).to.equal(18000)
    expect(errors[0].category).to.equal(ts.DiagnosticCategory.Error)
    expect(errors[0].messageText).to.equal(`Circularity detected extending from "${base}"`)
  })
})
