export const ADD_VIEWER      = 'ADD_VIEWER';
export const REMOVE_VIEWER   = 'REMOVE_VIEWER';
export const TOGGLE_ARCH     = 'TOGGLE_ARCH';
export const TOGGLE_SEGMASKS = 'TOGGLE_SEGMASKS';

export const addViewer      = viewerID => ({ type: ADD_VIEWER, viewerID}); //ID obtained by process.pid
export const removeViewer   = viewerID => ({ type: REMOVE_VIEWER, viewerID });
export const toggleArch     = viewerID => ({ type: TOGGLE_ARCH, viewerID });
export const toggleSegMasks = viewerID => ({ type: TOGGLE_SEGMASKS, viewerID });
