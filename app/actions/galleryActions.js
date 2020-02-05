export const OPEN_DIR       = 'OPEN_DIR';
export const REMOVE_DIR     = 'REMOVE_DIR';
export const TOGGLE_DIR     = 'TOGGLE_DIR';
export const REFRESH_DIRS   = 'REFRESH_DIRS'
export const SHOW_MODAL     = 'SHOW_MODAL';
export const CLOSE_MODAL    = 'CLOSE_MODAL';
export const UPDATE_MODAL   = 'UPDATE_MODAL';
export const IMPORT_CONFIG  = 'IMPORT_CONFIG';
export const UPDATE_CHECKED = 'UPDATE_CHECKED';
export const ADD_FILES      = 'ADD_FILES';
export const ADD_THUMB      = 'ADD_THUMB';
export const UPDATE_FILTER_TEXT = 'UPDATE_FILTER_TEXT';
export const UPDATE_FILTER_ANALYSED = 'UPDATE_FILTER_ANALYSED';
export const UPDATE_PARSED_RSML = "UPDATE_PARSED_RSML";
export const UPDATE_FILE = 'UPDATE_FILE';

export const addFolders    = paths => ({ type: OPEN_DIR, paths });
export const toggleOpenFile = path => ({ type: TOGGLE_DIR, path });
export const remove        = path  => ({ type: REMOVE_DIR, path });
export const refreshFiles  = files => ({ type: REFRESH_DIRS, files});
export const showModal     = ()    => ({ type: SHOW_MODAL });
export const closeModal    = ()    => ({ type: CLOSE_MODAL });
export const updateModal   = tree  => ({ type: UPDATE_MODAL, tree });
export const importConfig  = data  => ({ type: IMPORT_CONFIG, data });
export const updateChecked = paths => ({ type: UPDATE_CHECKED, paths });
export const addFiles      = (folder, files) => ({ type: ADD_FILES, folder, files });
export const addThumb      = (folder, fileName, thumb) => ({ type: ADD_THUMB, folder, fileName, thumb}) //folder: full folder path string, fileName: file string, no ext
export const updateFilterText = text => ({ type: UPDATE_FILTER_TEXT, text });
export const updateFilterAnalysed = checked => ({ type: UPDATE_FILTER_ANALYSED, checked });
export const updateParsedRSML = (folder, fileName, rsml) => ({ type: UPDATE_PARSED_RSML, folder, fileName, rsml});
export const updateFile = (folder, fileName, newExts) => ({ type: UPDATE_FILE, folder, fileName, newExts });