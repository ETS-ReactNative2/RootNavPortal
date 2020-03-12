import os from 'os'
import path from 'path'
import { writeFile, existsSync, mkdirSync } from 'fs';

export const APPHOME    = `${os.homedir()}${path.sep}.rootnav${path.sep}`;
export const PLUGINDIR  = `${process.env.PORTABLE_EXECUTABLE_DIR || process.cwd()}${path.sep}plugins${path.sep}`;
export const CONFIG     = 'config.json';
export const API_DELETE = 'api-delete';
export const API_PARSE  = 'api-parse';
export const API_THUMB = 'api-thumb';

export const WINDOW_HEIGHT = 728;
export const WINDOW_WIDTH  = 1024;

export const IMAGE_EXTS = ['jpg', 'jpeg', 'jpe', 'jfif', 'jif', 'png', 'tif', 'tiff'];
export const DATA_EXTS  = ['rsml'];
export const ALL_EXTS   = IMAGE_EXTS.concat(DATA_EXTS);

export const IMAGE_EXTS_REGEX = new RegExp(`(?:${IMAGE_EXTS.join("|")})$`, 'i') // Regex for all image extensions (i - case insensitive), excludes extThumbs
//First line is for file_C1.png convention for seg masks, latter line is for file.first_order.png - imo the .first_order.png convention is better, more informative, and more distinct, as _C1 could be a substring of a name.
export const ALL_EXTS_REGEX   = new RegExp(`(.+?)(_C(?:1|2))?\.(${ALL_EXTS.join("|")})$`, 'i');     // Regex for all files (i - case insensitive) - (dir path)(_C1 {if exists})(extension)
// export const ALL_EXTS_REGEX   = new RegExp(`([^.]+)(?:\.(.+))?\.(${ALL_EXTS.join("|")})$`, 'i'); // Regex for all files (i - case insensitive) - (dir path)(first_order {if exists})(extension)
export const _require = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require

//Backend
export const INFLIGHT_REQS = 5;
export const API_POLLTIME  = 1000 * 10; //API poll interval in milliseconds
export const API_MODELS = [
    { apiName: "arabidopsis_plate", displayName: "Arabidopsis Plate Assay" }, 
    { apiName: "osr_bluepaper",     displayName: "Oilseed Rape (Blue Paper)" }, 
    { apiName: "wheat_bluepaper",   displayName: "Wheat (Blue Paper)" } 
];

export const THUMB_PERCENTAGE = 20
export const COLOURS = { PRIMARY: '#f53', LATERAL: '#ffff00', HOVERED: 'white' };

export const matchPathName = path => path.match(/(?<path>.+)(?:\\|\/)(?<fileName>.+)/).groups; //Matches the file's dir path and actual name. no trailing slash on the path

export const writeConfig = config => {
    if (!existsSync(APPHOME)) //Use our own directory to ensure write access when prod builds as read only.
        mkdirSync(APPHOME, '0777', true, err => { //0777 HMMMM change later
            if (err) console.error(err);
        });
    writeFile(APPHOME + CONFIG , config, err => { //Perhaps we add a callback as an argument if needed
        if (err) console.error(err); //idk do some handling here
    });;
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