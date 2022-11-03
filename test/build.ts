import { assert, build, merge } from '@plugjs/plug'

export default build({
  async test_install() {
    const pipe1 = merge([])
    assert(typeof pipe1.tsc === 'undefined', 'Typescript already installed')
    // @ts-ignore
    await import('../src/index')
    const pipe2 = merge([])
    assert(typeof pipe2.tsc === 'function', 'Typescript not installed')
  },

  async test(): Promise<void> {
    await this.test_install()
  },
})
