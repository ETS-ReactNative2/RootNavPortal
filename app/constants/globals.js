import os from 'os'
import { sep }  from 'path'
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { remote } from 'electron';
import { post, get, defaults } from 'axios';

import { SHOW_MODAL, CLOSE_MODAL, UPDATE_MODAL, UPDATE_CHECKED, UPDATE_FILTER_TEXT, 
    UPDATE_FILTER_ANALYSED, UPDATE_CHECKLIST_DROPDOWN, TOGGLE_LABELS, TOGGLE_GALLERY_ARCH, TOGGLE_DIR, ADD_THUMB, UPDATE_API_MODAL } from '../actions/galleryActions';
import { TOGGLE_ARCH, TOGGLE_SEGMASKS, PUSH_EDITSTACK, POP_EDITSTACK, RESET_EDITSTACK, UPDATE_CHECKED as UPDATE_CHECKED_VIEWER } from '../actions/viewerActions';


export const APPHOME    = `${os.homedir()}${sep}.rootnav${sep}`;
export const PLUGINDIR  = `${process.env.PORTABLE_EXECUTABLE_DIR || process.argv.includes('--packaged=true') ? process.resourcesPath : process.cwd()}${sep}plugins${sep}`; //resourcesPath will get us to the right place on BOTH OSs, but only needed in release.
export const CONFIG     = 'config.json';
export const API_DELETE = 'api-delete';
export const API_PARSE  = 'api-parse';
export const CLOSE_VIEWER = 'close-viewer';
export const NOTIFICATION_CLICKED = 'NOTIFICATION_CLOSED';
export const HTTP_PORT = 9000;

export const WINDOW_HEIGHT = 800;
export const WINDOW_WIDTH  = 1200;

export const IMAGE_EXTS = ['jpg', 'jpeg', 'jpe', 'jfif', 'jif', 'png', 'tif', 'tiff'];
export const DATA_EXTS  = ['rsml'];
export const ALL_EXTS   = IMAGE_EXTS.concat(DATA_EXTS);

export const IMAGE_EXTS_REGEX = new RegExp(`(?:${IMAGE_EXTS.join("|")})$`, 'i') // Regex for all image extensions (i - case insensitive), excludes extThumbs
//First line is for file_C1.png convention for seg masks, latter line is for file.first_order.png - imo the .first_order.png convention is better, more informative, and more distinct, as _C1 could be a substring of a name.
export const ALL_EXTS_REGEX   = new RegExp(`(?<fileName>.+?)(?<segMask>_C(?:1|2))?\.(?<ext>${ALL_EXTS.join("|")})$`, 'i');     // Regex for all files (i - case insensitive) - (dir path)(_C1 {if exists})(extension)
// export const ALL_EXTS_REGEX   = new RegExp(`([^.]+)(?:\.(.+))?\.(${ALL_EXTS.join("|")})$`, 'i'); // Regex for all files (i - case insensitive) - (dir path)(first_order {if exists})(extension)
export const _require = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require

//Backend
export const INFLIGHT_REQS = 10;
export const API_POLLTIME  = 1000 * 5; //API poll interval in milliseconds

export const THUMB_PERCENTAGE = 15;
export const COLOURS = { PRIMARY: '#f53', LATERAL: '#ffff00', HOVERED: 'white' };

export const DEFAULT_CONFIG = { apiAdrdress: "", apiKey: "", folders: [] };

export const matchPathName = path => path.match(/(?<path>.+)(?:\\|\/)(?<fileName>.+)/).groups || { path: "", fileName: "" }; //Matches the file's dir path and actual name. no trailing slash on the path

export const getProcessTypeFromURL = url => {
    const groups = url.match(/\/app.html\?(?<name>[a-z]*)/).groups;
    return groups ? groups.name || "" : "";
}

export const writeConfig = config => {
    if (!existsSync(APPHOME)) //Use our own directory to ensure write access when prod builds as read only.
        mkdirSync(APPHOME, {mode: '0777', recursive: true});
    writeFileSync(APPHOME + CONFIG , config);
};

export const xmlOptions = {
    object: true,
    reversible: true,
    coerce: false,
    sanitize: true,
    trim: true,
    arrayNotation: true,
    alternateTextNode: false
};

export const jsonOptions = {
    sanitize: false,
    ignoreNull: true
};

// Any redux that only needs to be in one process gets filtered here!
export const reduxActionFilter = action => {
    const process = getProcessTypeFromURL(remote.getCurrentWindow().webContents.getURL());
    switch (process) {
        case "gallery":
            return ![SHOW_MODAL, CLOSE_MODAL, UPDATE_MODAL, UPDATE_CHECKED, UPDATE_FILTER_TEXT, 
                UPDATE_FILTER_ANALYSED, UPDATE_CHECKLIST_DROPDOWN, TOGGLE_DIR, TOGGLE_LABELS, TOGGLE_GALLERY_ARCH, ADD_THUMB, UPDATE_API_MODAL].includes(action.type);
        case "viewer":
            return ![TOGGLE_ARCH, TOGGLE_SEGMASKS, PUSH_EDITSTACK, POP_EDITSTACK, RESET_EDITSTACK, UPDATE_CHECKED_VIEWER, UPDATE_API_MODAL].includes(action.type);
        default:
            return true;
    }
}

export const sendThumbs = (thumbs, addThumbs) => {
    return new Promise((resolve, reject) => {
        get(`http://127.0.0.1:${HTTP_PORT}/health`).then(res => {
            post(`http://127.0.0.1:${HTTP_PORT}/thumb`, thumbs).then(res => resolve(addThumbs(res.data))).catch(err => setTimeout(() => resolve(sendThumbs(thumbs, addThumbs)), 2000)); //If Axios hangs up, try again.
        }).catch(err => setTimeout(() => resolve(sendThumbs(thumbs, addThumbs)), 5000)); //If backend isn't up yet, wait 5s and try again.
        //Add some limit to this, in case firewalls or similar block local HTTP server, in which case we have a big problem.
    });
};
defaults.adapter = _require('axios/lib/adapters/http'); //Axios will otherwise default to the XHR adapter due to being in an Electron browser, and won't work.
