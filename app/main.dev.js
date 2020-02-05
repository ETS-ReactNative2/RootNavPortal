/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import Store from './store/configureStore';
const { configureStore } = Store('main'); //Import is a func that sets the type of history based on the process scope calling it and returns the store configurer
import axios from 'axios';
import { API_PATH, WINDOW_HEIGHT, WINDOW_WIDTH, API_CHANNEL } from './constants/globals';

global.API_STATUS = false;
axios.get(API_PATH + "/model").then(res => { console.log("API is up"); global.API_STATUS = true}).catch(err => global.API_STATUS = false);

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}
const store = configureStore({}, 'main');

//Hot reload reducers in main process
ipcMain.on('renderer-reload', (event, action) => {
  delete require.cache[require.resolve('./reducers')];
  store.replaceReducer(require('./reducers'));
  event.returnValue = true;
});

let mainWindow = null;
let backendWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  mainWindow.loadURL(`file://${__dirname}/app.html?gallery`);
  mainWindow.webContents.on("did-frame-finish-load", () => {
    mainWindow.webContents.once("devtools-opened", () => {
      });
    mainWindow.webContents.openDevTools();
  });

  ipcMain.on('openFolder', (event, path) => {
    dialog.showOpenDialog(mainWindow, { properties: ['openDirectory', 'multiSelections'] }).then(result => 
      {
        if (result.filePaths && !result.canceled)
          event.sender.send('folderData', result.filePaths) 
      });
  });

  ipcMain.on('openViewer', (event, path) => {
    let subWindow = new BrowserWindow({
      width: WINDOW_WIDTH,
      height: WINDOW_HEIGHT,
      webPreferences: {
        nodeIntegration: true,
      }
    });

    subWindow.loadURL(`file://${__dirname}/app.html?viewer?${path}`);
    subWindow.webContents.on('did-finish-load', () => {
      if (!subWindow) {
        throw new Error('"subWindow" is not defined');
      }
      subWindow.show();
      subWindow.focus();
    });
  
    subWindow.on('closed', () => {
      subWindow = null;
    });
  });

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();

  //Open backend last
  backendWindow = new BrowserWindow({
    show: false,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    webPreferences: { nodeIntegration: true }
  });
  backendWindow.loadURL(`file://${__dirname}/app.html?backend`);

  ipcMain.on(API_CHANNEL, (event, paths) => {
    backendWindow.webContents.send(API_CHANNEL, paths)
  });
});
