import { OPEN_DIR, REFRESH_DIRS, REMOVE_DIR, CLOSE_MODAL, SHOW_MODAL, UPDATE_MODAL, READ_CONFIG } from '../actions/galleryActions';

const initialState = {folders: [], modal: false, modalBody: [], hasReadConfig: false};

export default (state = initialState, action) => {
    switch (action.type)
    {
        //Directory reducer actions
        case OPEN_DIR: return {
            ...state,
            folders: state.folders.concat(action.paths)
        };
        case REFRESH_DIRS: return state;
        case REMOVE_DIR: return {
            ...state,
            folders: state.folders.filter(path => path != action.path)
        };

        //Modal reducer actions
        case SHOW_MODAL:
            return {
                ...state,
                modal: true
            };
        case CLOSE_MODAL:
            return {
                ...state,
                modal: false
            };
        case UPDATE_MODAL:
            return {
                ...state,
                modalBody: action.tree
            };
        case READ_CONFIG:
            return {
                ...state,
                hasReadConfig: true,
                folders: action.data
            };
        default: return state;
    }
}
