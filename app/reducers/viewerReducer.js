import { ADD_VIEWER, TOGGLE_ARCH, TOGGLE_SEGMASKS } from '../actions/viewerActions';

const initialState = {viewers: {}};

export default (state = initialState, action) => {
    switch (action.type)
    {
        case ADD_VIEWER: return {
            ...state,
            viewers: {
                ...state.viewers,
                [action.viewerID]: { 
                    architecture: true, 
                    segMasks: false 
                }
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
        default: return state;
    }
}

/*
//Viewers are indexed by their process.pid values, as multiple viewers cannot interact/share their own state variables
//Architecture - value of the architecture checkbox which defines whether or not to draw the RSML over the image

state: {
    viewer: {
        12188: {
            architecture: true,
            segMasks: false
        },
        1853: {
            architecture: false
            segMasks: true
        }
    }
}
*/