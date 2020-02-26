import os from 'os'
import path from 'path'

export const APPHOME    = `${os.homedir()}${path.sep}.rootnav${path.sep}`;
export const PLUGINDIR  = `${process.env.PORTABLE_EXECUTABLE_DIR || process.cwd()}${path.sep}plugins${path.sep}`;
export const CONFIG     = 'config.json';
export const API_HOST   = 'http://127.0.0.1';
export const API_PORT   = 8841;
export const API_PATH   = API_HOST + ":" + API_PORT;
export const API_ADD    = 'api-add';
export const API_DELETE = 'api-delete';
export const API_PARSE  = 'api-parse';

export const WINDOW_HEIGHT = 728;
export const WINDOW_WIDTH  = 1024;

export const IMAGE_EXTS = ['jpg', 'jpeg', 'jpe', 'jfif', 'jif', 'png', 'tif', 'tiff'];
export const DATA_EXTS  = ['rsml'];
export const ALL_EXTS   = IMAGE_EXTS.concat(DATA_EXTS);

export const IMAGE_EXTS_REGEX = new RegExp(`(?:${IMAGE_EXTS.join("|")})$`, 'i') // Regex for all image extensions (i - case insensitive), excludes extThumbs
export const ALL_EXTS_REGEX   = new RegExp(`([^.]+)(?:\.(.+))?\.(${ALL_EXTS.join("|")})$`, 'i'); // Regex for all files (i - case insensitive) - (dir path)(first_order {if exists})(extension)
export const _require = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require

//Backend
export const INFLIGHT_REQS = 5;
export const API_POLLTIME  = 1000 * 10; //API poll interval in milliseconds
export const API_MODELS = [
    { apiName: "arabidopsis_plate", displayName: "Arabidopsis Plate Assay" }, 
    { apiName: "osr_bluepaper",     displayName: "Oilseed Rape (Blue Paper)" }, 
    { apiName: "wheat_bluepaper",   displayName: "Wheat (Blue Paper)" } 
];

export const matchPathName = path => path.match(/(.+)(?:\\|\/)(.+)/); //Matches the file's dir path and actual name. no trailing slash on the path

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