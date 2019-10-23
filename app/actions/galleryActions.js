import type { GetState, Dispatch } from '../reducers/types';

export const OPEN_DIR     = 'OPEN_DIR';
export const REMOVE_DIR   = 'REMOVE_DIR';
export const REFRESH_DIRS = 'REFRESH_DIRS'

export const add     = (path) => ({ type: OPEN_DIR, path });
export const remove  = () => ({ type: REMOVE_DIR });
export const refresh = () => ({ type: REFRESH_DIRS });
