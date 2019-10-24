export const OPEN_DIR     = 'OPEN_DIR';
export const REMOVE_DIR   = 'REMOVE_DIR';
export const REFRESH_DIRS = 'REFRESH_DIRS'

export const add     = (paths) => ({ type: OPEN_DIR, paths });
export const remove  = () => ({ type: REMOVE_DIR });
export const refresh = () => ({ type: REFRESH_DIRS });
