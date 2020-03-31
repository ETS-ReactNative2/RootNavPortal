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
export const UPDATE_CHECKLIST_DROPDOWN = 'UPDATE_CHECKLIST_DROPDOWN';
export const UPDATE_FOLDER_MODEL = 'UPDATE_FOLDER_MODEL';
export const UPDATE_FILE = 'UPDATE_FILE';
export const RESET_FOLDER = 'RESET_FOLDER';
export const TOGGLE_LABELS = 'TOGGLE_LABELS';
export const TOGGLE_GALLERY_ARCH = 'TOGGLE_GALLERY_ARCH';
export const SAVE_API_SETTINGS = 'SAVE_API_SETTINGS';
export const UPDATE_API_STATUS = 'UPDATE_API_STATUS';
export const UPDATE_API_MODAL = 'UPDATE_API_MODAL';
export const UPDATE_API_AUTH = 'UPDATE_API_AUTH';

export const addFolders    = folderInfo => ({ type: OPEN_DIR, folderInfo });
export const toggleOpenFile = path => ({ type: TOGGLE_DIR, path });
export const remove        = path  => ({ type: REMOVE_DIR, path });
export const refreshFiles  = files => ({ type: REFRESH_DIRS, files});
export const showModal     = ()    => ({ type: SHOW_MODAL });
export const closeModal    = ()    => ({ type: CLOSE_MODAL });
export const updateModal   = tree  => ({ type: UPDATE_MODAL, tree });
export const importConfig  = (folders, apiAddress, apiKey)  => ({ type: IMPORT_CONFIG, folders, apiAddress, apiKey });
export const updateChecked = checked => ({ type: UPDATE_CHECKED, checked });
export const addFiles      = (folder, files) => ({ type: ADD_FILES, folder, files });
export const addThumb      = (folder, fileName, thumb) => ({ type: ADD_THUMB, folder, fileName, thumb }) //folder: full folder path string, fileName: file string, no ext
export const updateFilterText = text => ({ type: UPDATE_FILTER_TEXT, text });
export const updateFilterAnalysed = checked => ({ type: UPDATE_FILTER_ANALYSED, checked });
export const updateParsedRSML = (folder, fileName, rsml) => ({ type: UPDATE_PARSED_RSML, folder, fileName, rsml });
export const updateChecklistDropdown = (path, model) => ({ type: UPDATE_CHECKLIST_DROPDOWN, path, model });
export const updateFolderModel = (path, model) => ({ type: UPDATE_FOLDER_MODEL, path, model });
export const updateFile = (folder, fileName, newExts) => ({ type: UPDATE_FILE, folder, fileName, newExts });
export const resetFolder = (folder, newState) => ({ type: RESET_FOLDER, folder, newState }); //newState should be the original structure, sans any API extensions
export const toggleLabels = () => ({ type: TOGGLE_LABELS });
export const toggleArch = () => ({ type: TOGGLE_GALLERY_ARCH });
export const saveAPISettings = (address, key) => ({ type: SAVE_API_SETTINGS, address, key }); //These need to be in gallery because they need to be written to config with the other things
export const updateAPIStatus = status => ({ type: UPDATE_API_STATUS, status });  
export const updateAPIModal = bool => ({ type: UPDATE_API_MODAL, bool }); //This is in Redux so the indicator button and menus can open the modal
export const updateAPIAuth = auth => ({ type: UPDATE_API_AUTH, auth });