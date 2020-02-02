import os from 'os'
import path from 'path'

export const APPHOME = `${os.homedir()}${path.sep}.rootnav${path.sep}`;
export const PLUGINDIR = `${process.env.PORTABLE_EXECUTABLE_DIR || process.cwd()}${path.sep}plugins${path.sep}`;
export const CONFIG  = 'config.json';
export const API_HOST = 'http://localhost';
export const API_PORT = 8841;
export const API_PATH = API_HOST + ":" + API_PORT;

export const IMAGE_EXTS = ['jpg', 'jpeg', 'jpe', 'jfif', 'jif', 'png', 'tif', 'tiff'];
export const DATA_EXTS = ['rsml'];
export const ALL_EXTS = IMAGE_EXTS.concat(DATA_EXTS);

export const IMAGE_EXTS_REGEX = new RegExp(IMAGE_EXTS.join("|"), 'i') // Regex for all image extensions (i - case insensitive)
export const ALL_EXTS_REGEX = new RegExp(`(.+)\.(${ALL_EXTS.join("|")})$`, 'i'); // Regex for all files (i - case insensitive)