export const OPEN_DIR     = 'OPEN_DIR';
export const REMOVE_DIR   = 'REMOVE_DIR';
export const REFRESH_DIRS = 'REFRESH_DIRS'
export const SHOW_MODAL   = 'SHOW_MODAL';
export const CLOSE_MODAL  = 'CLOSE_MODAL';
export const UPDATE_MODAL = 'UPDATE_MODAL';

export const add         = paths => ({ type: OPEN_DIR, paths });
export const remove      = path  => ({ type: REMOVE_DIR, path });
export const refresh     = ()    => ({ type: REFRESH_DIRS });
export const showModal   = ()    => ({ type: SHOW_MODAL });
export const closeModal  = ()    => ({ type: CLOSE_MODAL });
export const updateModal = tree  => ({ type: UPDATE_MODAL, tree });