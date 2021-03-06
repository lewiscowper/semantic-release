# semantic-release
| [![Build Status](https://travis-ci.org/semantic-release/semantic-release.svg?branch=next)](https://travis-ci.org/semantic-release/semantic-release) | [![Coverage Status](https://coveralls.io/repos/semantic-release/semantic-release/badge.svg?branch=next&service=github)](https://coveralls.io/github/semantic-release/semantic-release?branch=next) | [![Dependency Status](https://david-dm.org/semantic-release/semantic-release/next.svg)](https://david-dm.org/semantic-release/semantic-release/next) | [![devDependency Status](https://david-dm.org/semantic-release/semantic-release/next/dev-status.svg)](https://david-dm.org/semantic-release/semantic-release/next#info=devDependencies) | [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard) |
| --- | --- | --- | --- | --- |
[![NPM](https://nodei.co/npm/semantic-release.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/semantic-release/)

## What is `semantic-release` about?

At its core `semantic-release` is a set of conventions that gives you **entirely automated, semver-compliant package publishing**. _Coincidentally_ these conventions make sense on their own – like meaningful commit messages.

This removes the immediate connection between human emotions and version numbers, so strictly following the [SemVer](http://semver.org/) spec is not a problem anymore – and that’s ultimately `semantic-release`’s goal.

> ### “We fail to follow SemVer – and why it needn’t matter”
> #### JSConf Budapest 2015

> [![JSConfBP Talk](https://cloud.githubusercontent.com/assets/908178/8032541/e9bf6300-0dd6-11e5-92c9-8a39211368af.png)](https://www.youtube.com/watch?v=tc2UgG5L7WM&index=6&list=PLFZ5NyC0xHDaaTy6tY9p0C0jd_rRRl5Zm)

> This talk gives you a complete introduction to the underlying concepts of this module

## How does it work?

Instead of writing [meaningless commit messages](http://whatthecommit.com/), we can take our time to think about the changes in the codebase and write them down. Following formalized conventions it this then possible to not only generate a helpful changelog, but to derive the next semantic version number from them.

This module ships with the [AngularJS Commit Message Conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit) and changelog generator, but you can [define your own](#plugins) style.

| 1. `semantic-release pre` | 2. `npm publish` | 3. `semantic-release post` |
| :--- | :--- | :---- |
| Writes, based on all commits that happened since the last release, the new version number to the `package.json`. | Publishes the new version to `npm`. | Generates a changelog and creates a [release](https://help.github.com/articles/about-releases/) (including a git tag) on GitHub. |

_Note:_ The current release/tag implementation is tied to GitHub, but could be opened up to Bitbucket, GitLab, et al. Feel free to send PRs for these services.

## Setup

Manual setup will soon be a thing of the past with the new `semantic-release-cli`.

![soon.jpg](https://cloud.githubusercontent.com/assets/908178/8766357/f3eadaca-2e34-11e5-8ebb-d40b9ae613d7.png)

In the meantime:

### `package.json`

Delete the `version` field from your `package.json`. _Really_. It's safe to do, because machines will take care of it from now on.

Install `semantic-release` and save it as a `devDependency`.

```bash
# stable channel
npm install --save-dev semantic-release

# next channel
npm install --save-dev semantic-release@next
```

Create a `semantic-release` script in the [`scripts` field](https://docs.npmjs.com/files/package.json#scripts) of your `package.json`.

```json
{
  "scripts": {
    "semantic-release": "semantic-release pre && npm publish && semantic-release post"
  }
}
```

Add a [`repository` field](https://docs.npmjs.com/files/package.json#repository) to the `package.json`.
You should do this anyway, but – as `semantic-relase` depends on it – now you have to.

### CI Server

The idea is that your CI Server runs `npm run semantic-relase` whenever a test run on your main branch succeeds. Per default these conditions are verified assuming a [Travis CI](https://travis-ci.org/) environment. This isn't tied to a specific service though. Using the [`verifyConditions` plugin](#verifyconditions) you can easily configure your own CI Server.

The CI environment has to export `CI=true` in order for `semantic-release` to not automatically perform a dry run. Most CI services do this by default.

You need to export access-tokens to the environment, so `semantic-relase` can authenticate itself with GitHub and npm.  [Get a token for GitHub on their website](https://github.com/settings/tokens/new), grant it the repo/public_repo scope, and export it as `GH_TOKEN`. The smoothest and securest way to do this on Travis CI is to use [their web interface](http://docs.travis-ci.com/user/environment-variables/#Defining-Variables-in-Repository-Settings).

Unfortunately there is no web interface for obtaining npm tokens yet, so you have to run `npm adduser` locally. Copy the token from your `~/.npmrc` file afterwards. Export it as `NPM_TOKEN`.

## Options

You can pass options either via command line (in [kebab-case](https://lodash.com/docs#kebabCase)) or in the `release` field of your `package.json` (in [camelCase](https://lodash.com/docs#camelCase)). The following two examples are the same, but CLI arguments take precedence.

| CLI | package.json |
| --- | --- |
| `semantic-release pre --no-debug` | `"release": { "debug": false }` |

These options are currently available:
- `branch`: The branch on which releases should happen. Default: `'master'`
- `debug`: If true doesn't actually publish to npm or write things to file. Default: `!process.env.CI`
- `githubToken`: The token used to authenticate with GitHub. Default: `process.env.GH_TOKEN`
- `githubUrl`: Optional. Pass your GitHub Enterprise endpoint.

_A few notes on `npm` config_:
1. The `npm` token can only be defined in the environment as `NPM_TOKEN`, because that's where `npm` itself is going to read it from.
2. In order to publish to a different `npm` registry you can just configure that how you would usually do it and `semantic-relase` will respect that setting.
3. If you want to use another dist-tag for your publishes than `'latest'` you can specify that inside the `package.json`'s [`publishConfig`](https://docs.npmjs.com/files/package.json#publishconfig) field.
4. `semantic-relase` generally tries to orientate itself towards `npm` – it inherits the loglevel for example.

## Plugins

Currently there are four steps where you can customize the `semantic-relase` behavior using plugins. A plugin is a regular [option](#options), but inside the `package.json` you can pass additional config.

```json
{
  "release": {
    "analyzeCommits": "npm-module-name",
    "generateNotes": "./path/to/a/local/module",
    "verifyConditions": {
      "path": "./path/to/a/module",
      "additional": "config"
    }
}
```

```
semantic-release pre --analyze-commits="npm-module-name"
```

A plugin itself is an async function that always receives three arguments.

```js
module.exports = function (pluginConfig, config, callback) {}
```

- `pluginConfig`: If the user of your plugin specifies additional plugin config in the `package.json` (see the `verifyConditions` example above) then it's this object.
- `config`: A config object containing a lot of information to act upon.
  - `env`: All environment variables
  - `npm`: Select npm configuration bits like `registry`, `tag` and `auth`
  - `options`: `semantic-release` options like `debug`, or `branch`
  - `pkg`: Parsed `package.json`
  - For certain plugins the `config` object contains even more information. See below.
- `callback`: If an error occurs pass it as first argument. Otherwise pass your result as second argument.


### `analyzeCommits`

This plugin is responsible for determining the type of the next release. It additionally receives a `commits` array inside `config`. One commit is an object with a `message` and `hash` property. Call the callback with `'major'`, `'premajor'`, `'minor'`, `'preminor'`, `'patch'`, `'prepatch'`, `'prerelease'`, or `null` if nothing changed. Have a look at the [default implementation](https://github.com/semantic-release/commit-analyzer/).

### `generateNotes`

This plugin is responsible for generating release notes. Call the callback with the notes as a string. Have a look at the [default implementation](https://github.com/semantic-release/release-notes-generator/).

### `verifyConditions`

This plugins is responsible for verifying that a release should happen in the first place. For example the [default implementation](https://github.com/semantic-release/condition-travis/) verifies that the publish is happening on Travis, that it's the right branch, and that all other build jobs succeeded. There are more use cases for this, e.g. verifying that test coverage is above a certain threshold or that there are no [vulnerabilities](https://nodesecurity.io/) in your dependencies. Be creative.

### `verifyRelease`

This plugin is responsible for verifying a release that was determined before and is about to be published. There is no default implementation. It additionally receives `nextRelease`, `lastRelease` and `commits` inside `config`. While `commits` is the same as with analyzeCommits, `nextRelease` contains a `type` (e.g. `'major'`) and the new version (e.g. `'1.0.0'`) and `lastRelease` contains the old `version`, the `gitHead` at the time of the release and the npm dist-`tag` (e.g. `'latest'`). Using this information you could [detect breaking changes](https://github.com/semantic-release/cracks) or hold back certain types of releases. Again: Be creative.

## ITYM*FAQ*LT
> I think you might frequently ask questions like these

### Why is the `package.json`'s version not updated in my repository?

The `npm` docs even state:

> The most important things in your package.json are the name and version fields. Those are actually required, and your package won't install without them.
> – [npm docs](https://docs.npmjs.com/files/package.json#version)

While this entirely true the version number doesn't have to be checked into source control. `semantic-release` takes care of the version field right before `npm publish` uses it – and this is the only point where it _really_ is required.

### Is there a way to preview which version would currently get published?

If you're running `npm run semantic-release` locally a dry run gets performed, which logs the version that would currently get published.

### Can I run this on my own machine rather than on a CI server?

Of course you can, but this doesn't necessarily mean you should. Running your tests on an independent machine before releasing software is a crucial part of this workflow. Also it is a pain to set this up locally, with tokens lying around and everything. That said, you can run the scripts with `--debug=false` explicitly. You have to export `GH_TOKEN=<your_token>` and `NPM_TOKEN=<your_other_token>`.

### Can I manually trigger the release of a specific version?

You can trigger a release by pushing to your GitHub repository. You deliberately can not trigger a _specific_ version release, because this is the whole point of `semantic-release`. Start your packages with `1.0.0` and semver on.  

### Is it _really_ a good idea to release on every push?

It is indeed a great idea because it _forces_ you to follow best practices. If you don't feel comfortable making every passing feature or fix on your master branch addressable via `npm` you might not treat your master right. Have a look at [branch workflows](https://guides.github.com/introduction/flow/index.html). If you still think you should have control over the exact point in time of your release, e.g. because you are following a release schedule, you can release only on the `production`/`deploy`/`release` branch and push your code there in certain intervals, or better yet use [dist-tags](https://docs.npmjs.com/cli/dist-tag).

### Why should I trust `semantic-release` with my releases?

`semantic-release` has a full unit- and integration-test-suite that tests _actual_ `npm` publishes against the [npm-registry-couchapp](https://github.com/npm/npm-registry-couchapp/) on node.js `^0.10`, `^0.12` and io.js `^1`, `^2`. A new version won't get published if it doesn't pass on all these engines.

Note: Currently integration-tests don't run on Travis CI. If you know stuff about npm/Travis/Couch: Please help!

## License

MIT License
2015 © Stephan Bönnemann and [contributors](https://github.com/semantic-release/semantic-release/graphs/contributors)

![https://twitter.com/trodrigues/status/509301317467373571](https://cloud.githubusercontent.com/assets/908178/6091690/cc86f58c-aeb8-11e4-94cb-15f15f486cde.png)
