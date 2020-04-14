# RootNav Portal
An application for analysing plant root systems, built with compatibility with the University of Nottingham's RootNav 2 API.

RootNavPortal is built on Electron, Node.js, React and Redux.
_put some pictures and banners in here for better styling later_

## Install
### For users
Releases are on the GitHub [releases page](https://github.com/Chagrilled/RootNavPortal/releases). Preference should be given to the installed application for Windows, over portable, for performance.

### For developers:
First, clone the repo via git:
```bash
git clone https://github.com/Chagrilled/RootNavPortal
```

And then install the dependencies with yarn.
```bash
cd RootNavPortal
yarn
```

  

## Run

Starts the app in the `dev` environment. This starts the renderer process in [**hot-module-replacement**](https://webpack.js.org/guides/hmr-react/) mode and starts a Webpack dev server that sends hot updates to the renderer process.
```bash
yarn dev
```

If you don't need autofocus when your files was changed, then run `dev` with env `START_MINIMIZED=true`:

```bash
$ START_MINIMIZED=true yarn dev
```
## Building
To run a `production` build with full Webpack configuration, run
```bash
yarn build
yarn start
```

## Packaging

To package apps, use the specified `package` script for your operating system:

```bash
yarn package-win
yarn package-mac
yarn package-linux
```

Note that RootNavPortal cannot be cross-compiled due to its native modules.

:bulb: You can debug your production build with devtools by simply setting the `DEBUG_PROD` env variable:

```bash
DEBUG_PROD=true yarn package
```
## Plugins
Plugins can be installed by placing a compatible JavaScript file into the application's `/resources/plugins` folder for installed versions, or in a `plugins` folder adjacent to the portable executable.  Refer to the [wiki documentation](https://github.com/Chagrilled/RootNavPortal/wiki) when writing plugins.

In development, plugins will be copied from the `plugins` folder into the installer's binary when packaging.

## Maintainers

- [Andrew Reynolds](https://github.com/Chagrilled)
- [Daniel Cordell](https://github.com/danielcrdl)
 