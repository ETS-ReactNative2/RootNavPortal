export const ADD_VIEWER      = 'ADD_VIEWER';
export const REMOVE_VIEWER   = 'REMOVE_VIEWER';
export const TOGGLE_ARCH     = 'TOGGLE_ARCH';
export const TOGGLE_SEGMASKS = 'TOGGLE_SEGMASKS';
export const PUSH_EDITSTACK = 'PUSH_EDITSTACK';
export const POP_EDITSTACK = 'POP_EDITSTACK';
export const RESET_EDITSTACK = 'RESET_EDITSTACK';
export const SAVE_RSML = 'SAVE_RSML';
export const UPDATE_CHECKED = 'CHECK_FOLDER';

export const addViewer      = viewerID => ({ type: ADD_VIEWER, viewerID}); //ID obtained by process.pid
export const removeViewer   = viewerID => ({ type: REMOVE_VIEWER, viewerID });
export const toggleArch     = viewerID => ({ type: TOGGLE_ARCH, viewerID });
export const toggleSegMasks = viewerID => ({ type: TOGGLE_SEGMASKS, viewerID });
export const pushEditStack  = (viewerID, lines) => ({ type: PUSH_EDITSTACK, viewerID, lines });
export const popEditStack = viewerID => ({ type: POP_EDITSTACK, viewerID });
export const resetEditStack = viewerID => ({ type: RESET_EDITSTACK, viewerID });
export const saveRSML = (viewerID, newRSML) => ({ type: SAVE_RSML, viewerID, newRSML });
export const updateChecked = checked => ({ type: UPDATE_CHECKED, checked })