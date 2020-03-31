import { ADD_INFLIGHT, ADD_QUEUE, REMOVE_INFLIGHT, REMOVE_QUEUE, UPDATE_MODELS } from '../actions/backendActions';

const initialState = { 
    queue: [], 
    inFlight: {}, 
    apiModels: [
        { apiName: "arabidopsis_plate", displayName: "Arabidopsis Plate Assay" }, 
        { apiName: "osr_bluepaper",     displayName: "Oilseed Rape (Blue Paper)" }, 
        { apiName: "wheat_bluepaper",   displayName: "Wheat (Blue Paper)" } 
    ],
    rootNavModel: -1
};

export default (state = initialState, action) => {
    switch (action.type)
    {
        case ADD_QUEUE: return {
            ...state,
            queue: state.queue.concat(action.path)
        }
        case ADD_INFLIGHT: return {
            ...state,
            inFlight: {
                ...state.inFlight,
                [action.file.name]: { model: action.file.model, ext: action.file.ext }
            }
        }
        case REMOVE_QUEUE: return {
            ...state,
            queue: state.queue.filter(path => path !== action.path)
        }
        case REMOVE_INFLIGHT: {
            const { [action.file]: omit, ...files } = state.inFlight; 
            return {
                ...state,
                inFlight: files || {}
            }
        }
        case UPDATE_MODELS: return {
            ...state,
            apiModels: action.apiModels,
            rootNavModel: action.rootNavModel
        }
        default: return state;
    }
}

/*
//Queue: Array of absolute paths that signify what the bcakend is waiting to send to the API
//inFlight: Object of objects indexed by folder/file path that signify which files are currently being processed/waiting for responses
//  - contains the model used as a check if it was changing while inflight, and the extension to store it for operations the backend uses later/anything else needing access to it

state: {
    backend: {
        queue: [
            "C:\Users\Andrew\blabla\testset_rn2.jpg",
            "C:\Users\Andrew\blabal\anotherfile.png"
        ],
        inFlight: {
            C:\Users\Andrew\blabla\image_rn2: {
                model: 'wheat_bluepaper',
                ext: '.jpg'
            },
            C:\Users\Andrew\blabla\INEW_LN2_249: {
                model: 'osr_bluepaper',
                ext: '.tif'
            }
        }
    }
}
*/