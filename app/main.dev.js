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
import { WINDOW_HEIGHT, WINDOW_WIDTH, API_DELETE, API_PARSE, API_THUMB } from './constants/globals';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const store = configureStore({}, 'main');
let bBackendReady = false;
let backendQueue = { add: [], parse: [], thumb: [] }; //Backend dead letter queue for late loading

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

  
  //Open backend last
  backendWindow = new BrowserWindow({
    show: false,
    width: 0,
    height: 0,
    webPreferences: { nodeIntegration: true },
    frame: false
  });
  
  backendWindow.loadURL(`file://${__dirname}/app.html?backend`);

  mainWindow = new BrowserWindow({
    show: false,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minHeight: WINDOW_HEIGHT,
    minWidth: WINDOW_WIDTH,
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

  ipcMain.on('getExportDest', event => {
      dialog.showSaveDialog(event.sender.getOwnerBrowserWindow(), { properties: ['showOverwriteConfirmation'], filters: [{ name: 'CSV (Comma delimited)', extensions: ['csv'] }] }).then(result => {
        if (result.filePath && !result.canceled) event.sender.send('exportDest', result.filePath);
      });
  });

  ipcMain.on('openViewer', (event, path) => {
    let subWindow = new BrowserWindow({
      width: WINDOW_WIDTH,
      height: WINDOW_HEIGHT,
      minHeight: WINDOW_HEIGHT,
      minWidth: WINDOW_WIDTH,
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
    app.quit();
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();

  backendWindow.on('ready-to-show', () => {
    bBackendReady = true;
    backendWindow.webContents.send(API_PARSE, backendQueue.parse);
    backendWindow.webContents.send(API_THUMB, backendQueue.thumb);
  });

  ipcMain.on(API_DELETE, (event, path) => { //path = { path: "C:\folder\stuff" }
    backendWindow.webContents.send(API_DELETE, path);
  });

  ipcMain.on(API_PARSE, (event, paths) => { // paths = [ "C:\folder\plant", "C:\folder\otherplant"] - a .rsml is appended in backend
    if (!bBackendReady) backendQueue.parse.push(...paths); //Suddenly the backend starting opening slower (or gallery faster) causing early IPCs to miss.
    else backendWindow.webContents.send(API_PARSE, paths); //Storing and sending a small dead letter queue until it's ready solves this potential issue.
  });

  ipcMain.on(API_THUMB, (event, data) => {  // data = { folder: "C:\blala", file: { rsml: true, png: true }, fileName: "plant" }
    if (!bBackendReady) backendQueue.thumb.push(...data); 
    else backendWindow.webContents.send(API_THUMB, data);
  });
});
