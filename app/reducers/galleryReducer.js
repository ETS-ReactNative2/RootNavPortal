import { OPEN_DIR, REFRESH_DIRS, REMOVE_DIR} from '../actions/galleryActions';
import type { Action } from './types';

export default (state = {folders: []}, action) => {
    switch (action.type)
    {
        case OPEN_DIR: {
            let newState = Object.assign({}, state);
            newState.folders.push(action.path)
        }     
        case REFRESH_DIRS: return state;
        case REMOVE_DIR:   return state;
        default: return state;
    }
}
