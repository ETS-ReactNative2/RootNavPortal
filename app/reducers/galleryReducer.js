import { OPEN_DIR, REFRESH_DIRS, REMOVE_DIR, CLOSE_MODAL, SHOW_MODAL, UPDATE_MODAL, 
    IMPORT_CONFIG, UPDATE_CHECKED, ADD_FILES, ADD_THUMB } from '../actions/galleryActions';

const initialState = { folders: [], modal: false, modalBody: [], hasReadConfig: false, checked: [], files: {} };

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
        case IMPORT_CONFIG:
            return {
                ...state,
                hasReadConfig: true,
                folders: action.data
            };
        case UPDATE_CHECKED:
            return {
                ...state,
                checked: action.paths
            }
        case ADD_FILES:
            return {
                ...state,
                files: {
                    ...state.files,
                    [action.folder]: action.files
                }
            }
        case ADD_THUMB:
            return {
                ...state,
                files: {
                    ...state.files,
                    [action.folder]: {
                        ...state.files[action.folder],
                        [action.file]: {
                            ...state.files[action.file],
                            thumb: action.thumb
                        }
                    }
                }
            }
        default: return state;
    }
}
