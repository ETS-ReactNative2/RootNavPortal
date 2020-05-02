import { ADD_VIEWER, REMOVE_VIEWER, TOGGLE_ARCH, TOGGLE_SEGMASKS, PUSH_EDITSTACK, POP_EDITSTACK, RESET_EDITSTACK, 
    UPDATE_CHECKED, UPDATE_VIEWER_FILTER, TOGGLE_FILTER_MODE } from '../actions/viewerActions';

const initialState =  { viewers: {} };

export default (state = initialState, action) => {
    switch (action.type)
    {
        case ADD_VIEWER: return {
            ...state,
            viewers: {
                ...state.viewers,
                [action.viewerID]: { 
                    architecture: true, 
                    segMasks: false ,
                    editStack: [],
                    checked: [],
                    filterText: "",
                    filterMode: false
                }
            }
        }
        case REMOVE_VIEWER: 
        {
            const { [action.viewerID]: removed, ...viewers } = state.viewers
            return {
                ...state,
                viewers: viewers || {}
            }
        }
        case TOGGLE_ARCH: return {
            ...state,
            viewers: {
                ...state.viewers,
                [action.viewerID]: { 
                    ...state.viewers[action.viewerID],
                    architecture: !state.viewers[action.viewerID].architecture 
                }
            }
        }
        case TOGGLE_SEGMASKS: return {
            ...state,
            viewers: {
                ...state.viewers,
                [action.viewerID]: {
                    ...state.viewers[action.viewerID],
                    segMasks: !state.viewers[action.viewerID].segMasks
                }
            }
        }
        case PUSH_EDITSTACK: return {
            ...state,
            viewers: {
                ...state.viewers,
                [action.viewerID]: {
                    ...state.viewers[action.viewerID],
                    editStack: [...state.viewers[action.viewerID].editStack, action.lines] //Non-mutating push
                }
            }
        }
        case POP_EDITSTACK: return {
            ...state,
            viewers: {
                ...state.viewers,
                [action.viewerID]: {
                    ...state.viewers[action.viewerID],
                    editStack: state.viewers[action.viewerID].editStack.filter((edit, index) => index != state.viewers[action.viewerID].editStack.length - 1) //Non-mutating pop
                }
            }
        }
        case RESET_EDITSTACK: return {
            ...state,
            viewers: {
                ...state.viewers,
                [action.viewerID]: {
                    ...state.viewers[action.viewerID],
                    editStack: []
                }
            }
        }
        case UPDATE_CHECKED: return {
            ...state,
            viewers: {
                ...state.viewers,
                [action.viewerID]: {
                    ...state.viewers[action.viewerID],
                    checked: action.checked
                }
            }
        }
        case UPDATE_VIEWER_FILTER: return {
            ...state,
            viewers: {
                ...state.viewers,
                [action.viewerID]: {
                    ...state.viewers[action.viewerID],
                    filterText: action.text
                }
            }
        }
        case TOGGLE_FILTER_MODE: return {
            ...state,
            viewers: {
                ...state.viewers,
                [action.viewerID]: {
                    ...state.viewers[action.viewerID],
                    filterMode: !state.viewers[action.viewerID].filterMode
                }
            }       
        }
        default: return state;
    }
}

/*
//Viewers are indexed by their process.pid values, as multiple viewers cannot interact/share their own state variables
//Architecture - value of the architecture checkbox which defines whether or not to draw the RSML over the image
//editStack - stores a history of edits -> each time the user does something to the canvas, the new state is pushed to the editStack
//This lets us pop the stack to undo an action. The editStack is the first place to look for polylines
//If the stack is empty, gallery.files.[file].parsedRSML.polylines will be used, which is what the RSML on disk represents
//Each viewer process maintains its own editStack, and it is reset on file move

state: {
    viewer: {
        viewers: {
            12188: {
                architecture: true,
                segMasks: false,
                editStack: [
                    [{}, {}, {}],
                    [{}, {}, {}]
                ],
                checked: ["C:\plants\wheat"]
            },
            1853: {
                architecture: false
                segMasks: true,
                editStack: [],
                checked: []
            }
        }
    }   
}
*/