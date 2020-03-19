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
import { app, BrowserWindow, ipcMain, dialog, Tray, Menu } from 'electron';
import Store from './store/configureStore';
const { configureStore } = Store('main'); //Import is a func that sets the type of history based on the process scope calling it and returns the store configurer
import { WINDOW_HEIGHT, WINDOW_WIDTH, API_DELETE, API_PARSE, API_THUMB, CLOSE_VIEWER } from './constants/globals';
import { join } from 'path';

// export default class AppUpdater {
//   constructor() {
//     log.transports.file.level = 'info';
//     autoUpdater.logger = log;
//     autoUpdater.checkForUpdatesAndNotify();
//   }
// }

let closeFlag; //Hack - app.quit causes the close event to fire again, so we need to terminate it early if the user wants to close the app
let appIcon = null; //Orphan variable required so the icon doesn't get GC'd by V8
let mainWindow = null;
let backendWindow = null;
let iconClick = () => mainWindow ? mainWindow.focus() : openGallery();

/**********************
**  Open the Gallery
***********************/
const openGallery = () => {
    mainWindow = new BrowserWindow({
        show: false,
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        minHeight: WINDOW_HEIGHT,
        minWidth: WINDOW_WIDTH,
        webPreferences: {
            nodeIntegration: true,
        },
        devTools: process.env.NODE_ENV === 'production' ? false : true
    });
    mainWindow.loadURL(`file://${__dirname}/app.html?gallery`);
    
    mainWindow.webContents.on('did-finish-load', () => {
        if (!mainWindow) throw new Error('"mainWindow" is not defined');

        if (process.env.START_MINIMIZED) mainWindow.minimize();
        else 
        {
            mainWindow.show();
            mainWindow.focus();
        }
    });

    mainWindow.on('close', event => {

        let state = store.getState();
        if ((!state.backend.queue.length && !Object.keys(state.backend.inFlight).length) || closeFlag) //If API is doing nothing, close all as per
        {
            mainWindow = null;
            return app.quit();
        }

        response = dialog.showMessageBox(mainWindow, { 
            type: 'question', 
            buttons: ['Close App', 'Background App'], 
            title: 'Close RootNav Portal', 
            cancelId: 2,
            message: 'There are currently files being, or waiting to be processed, would you like to close RootNav or background it to continue processing? It can be reopened or closed from the app icon.'
        }).then(response => {
            switch (response)
            {
                case 0: { closeFlag = true; app.quit(); }; //app.quit causes this to refire - so closeFlag will kill the app
                case 1: { 
                    BrowserWindow.getAllWindows().forEach(window => window.webContents.getURL().match(/\?(?:backend)|(?:gallery)/) ? {} : window.close()); 
                    mainWindow = null; 
                    return; 
                }
                case 2: event.preventDefault(); //cancel the close
            } //0 is close, 1 is background, 2 is cancelled
        });
    });
};

/**********************
** Core Redux Setup
***********************/
const store = configureStore({}, 'main');
let bBackendReady = false;
let backendQueue = { parse: [], thumb: [] }; //Backend dead letter queue for late loading
//Hot reload reducers in main process
ipcMain.on('renderer-reload', (event, action) => {
    delete require.cache[require.resolve('./reducers')];
    store.replaceReducer(require('./reducers'));
    event.returnValue = true;
});

/**********************
**  DevTools Setup
***********************/
if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true')
    require('electron-debug')();

const installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

    return Promise.all(extensions.map(name => installer.default(installer[name], forceDownload))).catch(console.log);
};

app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') app.quit();
});

/***********************************
**  Electron Init Done - Startup
************************************/
app.on('ready', async () => {

    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') 
        await installExtensions();

    //Loading main window first may feel more responsive, but it results in less thumbs loaded since the backend hasn't launched to start computing yet.
    //Not sure which ordering I like yet.
    
    openGallery();

    //Open backend last
    backendWindow = new BrowserWindow({
        show: false,
        width: 0,
        height: 0,
        webPreferences: { nodeIntegration: true },
        frame: false,
        skipTaskbar: true,
        devTools: process.env.NODE_ENV === 'production' ? false : true
    });
  
    backendWindow.loadURL(`file://${__dirname}/app.html?backend`);

    // @TODO: Use 'ready-to-show' event
    //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event

    backendWindow.on('ready-to-show', () => {
        bBackendReady = true;
        backendWindow.webContents.send(API_PARSE, backendQueue.parse);
        backendWindow.webContents.send(API_THUMB, backendQueue.thumb);
    });

    /**********************
    **  Icon Tray Settings
    ***********************/
    if (!appIcon)
    {    
        appIcon = new Tray(app.isPackaged ? join(process.resourcesPath, 'icons', '16x16.png') : "./resources/icons/16x16.png"); //Location changes when packaged, so account for that

        appIcon.setToolTip('RootNav Portal');

        appIcon.setContextMenu(Menu.buildFromTemplate([
            { label: 'Close', click: () => app.quit() }, //Icon tray close will close the whole app
            { label: 'Open Gallery', click: iconClick }
        ]));

        appIcon.on('right-click', () => appIcon.popUpContextMenu());
        appIcon.on('click', iconClick); //Either open a new gallery or grab the current one
    }
    // new AppUpdater();
});

/**********************
**  Event Listeners
***********************/
ipcMain.on('openFolder', (event, path) => {
    dialog.showOpenDialog(mainWindow, { properties: ['openDirectory', 'multiSelections'] }).then(result => {
        if (result.filePaths && !result.canceled)
            event.sender.send('folderData', result.filePaths); 
    });
});

ipcMain.on('getExportDest', event => {
    dialog.showSaveDialog(event.sender.getOwnerBrowserWindow(), { properties: ['showOverwriteConfirmation'], filters: [{ name: 'CSV (Comma delimited)', extensions: ['csv'] }] }).then(result => {
        if (result.filePath && !result.canceled) event.sender.send('exportDest', result.filePath);
    });
});

ipcMain.on(CLOSE_VIEWER, (event, path) => {
    BrowserWindow.getAllWindows().forEach(window => window.webContents.send(CLOSE_VIEWER, path));
});

/**********************
**  Open Viewer Event
***********************/
ipcMain.on('openViewer', (event, path) => {
    let subWindow = new BrowserWindow({
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        minHeight: WINDOW_HEIGHT,
        minWidth: WINDOW_WIDTH,
        webPreferences: {
            nodeIntegration: true,
        },
        devTools: process.env.NODE_ENV === 'production' ? false : true
    }); 

    subWindow.loadURL(`file://${__dirname}/app.html?viewer?${path}`);

    subWindow.webContents.on('did-finish-load', () => {
        if (!subWindow) throw new Error('"subWindow" is not defined');
        subWindow.show();
        subWindow.focus();
    });

    subWindow.on('closed', () => {
        subWindow = null;
    });
});

/**********************
**  Backend DLQs
***********************/
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