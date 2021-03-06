const test = require('tap').test
const proxyquire = require('proxyquire')

require('../mocks/registry')
const pre = proxyquire('../../dist/pre', {
  'child_process': require('../mocks/child-process')
})

const plugins = {
  verifyRelease: (release, cb) => cb(null, release),
  analyzeCommits: (commits, cb) => cb(null, 'major')
}

const npm = {
  registry: 'http://registry.npmjs.org/',
  tag: 'latest'

}

test('full pre run', (t) => {
  t.test('increase version', (tt) => {
    tt.plan(3)

    pre({
      npm,
      pkg: {name: 'available'},
      plugins
    }, (err, release) => {
      tt.error(err)
      tt.is(release.type, 'major')
      tt.is(release.version, '2.0.0')
    })
  })

  t.test('increase version', (tt) => {
    tt.plan(3)

    pre({
      npm,
      pkg: {name: 'unavailable'},
      plugins
    }, (err, release) => {
      tt.error(err)
      tt.is(release.type, 'initial')
      tt.is(release.version, '1.0.0')
    })
  })

  t.end()
})
