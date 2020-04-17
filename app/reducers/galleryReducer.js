import { OPEN_DIR, REFRESH_DIRS, REMOVE_DIR, TOGGLE_DIR, CLOSE_MODAL, SHOW_MODAL, UPDATE_MODAL, 
    IMPORT_CONFIG, UPDATE_CHECKED, ADD_FILES, ADD_THUMB, REMOVE_THUMB, UPDATE_FILTER_TEXT, UPDATE_FILTER_ANALYSED, 
    UPDATE_PARSED_RSML, UPDATE_CHECKLIST_DROPDOWN, UPDATE_FOLDER_MODEL, UPDATE_FILE, RESET_FOLDER, 
    TOGGLE_LABELS, TOGGLE_GALLERY_ARCH, SAVE_API_SETTINGS, UPDATE_API_STATUS, UPDATE_API_MODAL, UPDATE_API_AUTH } from '../actions/galleryActions';

const initialState = { folders: [], files: {}, thumbs: {}, modal: false, modalBody: [], checked: [], hasReadConfig: false,  filterText: "", 
    filterAnalysed: false, labels: false, architecture: true, apiAddress: '', apiKey: '', apiStatus: false, apiModal: false, apiAuth: true };

export default (state = initialState, action) => {
    switch (action.type)
    {
        //Directory reducer actions
        case OPEN_DIR: return {
            ...state,
            folders: state.folders.concat(action.folderInfo)
        };
        case REFRESH_DIRS: return {
            ...state,
            files: action.files
        }
        case REMOVE_DIR: {
            const { [action.path]: omit, ...files } = state.files; // Remove the files relating to this path.
            const { [action.path]: omitThumbs, ...thumbs } = state.thumbs;
            return {
                ...state,
                thumbs: thumbs || {},
                folders: state.folders.filter(folder => folder.path !== action.path),
                files: files ? files: {},
                checked: state.checked.filter(path => path !== action.path)
            };
        }
        case TOGGLE_DIR: return {
            ...state,
            folders: state.folders.map(folder => folder.path == action.path ? {...folder, 'active':!folder.active} : folder)
        }

        //Modal reducer actions
        case SHOW_MODAL: return {
            ...state,
            modal: true
        };
        case CLOSE_MODAL: return {
            ...state,
            modal: false
        };
        case UPDATE_MODAL: return {
            ...state,
            modalBody: action.tree
        };
        case IMPORT_CONFIG: return {
            ...state,
            hasReadConfig: true,
            folders: action.folders,
            apiAddress: action.apiAddress,
            apiKey: action.apiKey
        };
        case UPDATE_CHECKED: return {
            ...state,
            checked: action.checked
        }
        case ADD_FILES: return {
            ...state,
            files: {
                ...state.files,
                [action.folder]: action.files
            }
        }
        //Adds a batch of thumbnails to the file structure
        //action.thumb = [{ folder: "C:\Andrew\Desktop\rsml", fileName: "wheat_1", ext: "png", thumb: {type: "Buffer", data: [x, x, x,]}, {...}}
        case ADD_THUMB: {
            return {
                ...state,
                thumbs: {
                    ...state.thumbs,
                    ...action.thumbs.reduce((acc, obj) => ({
                        ...acc, 
                        [obj.folder]: {
                            ...(state.thumbs[obj.folder] || {}),
                            ...(acc[obj.folder] || {}),
                            [obj.fileName]: obj.thumb
                        }
                    }), {})
                }
            }
        }
        case REMOVE_THUMB: {
            console.log(action.toRemove);
            const x =  {
                ...state,
                thumbs: {
                    ...Object.fromEntries(
                        Object.entries(state.thumbs).reduce((acc, folder) => ([
                            ...acc,
                            [folder[0], Object.fromEntries(
                                Object.entries(folder[1])
                                    .filter(file => !action.toRemove.some(it => it.folder == folder[0] && it.filename == file[0]))
                            )]
                        ]), [])
                    )
                }
            }
            console.log(x.thumbs)
            return x;
        }
        case UPDATE_FILTER_TEXT: return {
            ...state,
            filterText: action.text
        }
        case UPDATE_FILTER_ANALYSED:
        return {
            ...state,
            filterAnalysed: action.checked
        }
        case UPDATE_PARSED_RSML: return {
            ...state,
            files: {
                ...state.files,
                ...action.newFiles.reduce((acc, obj) => ({
                    ...acc, 
                    [obj.path]: {
                        ...state.files[obj.path],
                        ...(acc[obj.path] || {}),
                        [obj.fileName]: {
                            ...state.files[obj.path][obj.fileName],
                            ...((acc[obj.path] || {})[obj.fileName] || {}),
                            parsedRSML: { rsmlJson: obj.rsmlJson, polylines: obj.polylines }
                        }
                    }
                }), {})
            }
        }
        case UPDATE_CHECKLIST_DROPDOWN: return {
            ...state,
            checked: state.checked.map(folder => action.path != folder.path ? folder : {...folder, model: action.model})
        }
        case UPDATE_FOLDER_MODEL: return {
            ...state,
            folders: state.folders.map(it => it.path == action.path ? {...it, model: action.model} : it)
        }
        case UPDATE_FILE: return {
            ...state,
            files: {
                ...state.files,
                [action.folder]: {
                    ...state.files[action.folder],
                    [action.fileName]: {
                        ...state.files[action.folder][action.fileName],
                        ...action.newExts
                    }
                }
            }
        }
        case RESET_FOLDER: return {
            ...state,
            files: {
                ...state.files,
                [action.folder] : action.newState //Write over the folder's state with our object constructed in the backend
            }
        }
        case TOGGLE_LABELS: return {
            ...state,
            labels: !state.labels
        }
        case TOGGLE_GALLERY_ARCH: return {
            ...state,
            architecture: !state.architecture
        }
        case SAVE_API_SETTINGS: return {
            ...state,
            apiAddress: action.address,
            apiKey: action.key
        }
        case UPDATE_API_STATUS: return {
            ...state,
            apiStatus: action.status
        }
        case UPDATE_API_MODAL: return {
            ...state,
            apiModal: action.bool
        }
        case UPDATE_API_AUTH: return {
            ...state,
            apiAuth: action.auth
        }
        default: return state;
    }
}


// folders       = array of all full folder paths loaded into state
// modalBody     = holds the tree structure anaylsed and displayed by the modal, used for component communication
// hasReadConfig = ensures we only read the config at boot
// checked:      = array of folder paths that represent what the user has ticked in the tree checklist
// filterText:   = Persistence of what's in the filter bar
// labels:       = bool that toggles if the filename text is displayed under each thumbnail
// architecture  = bool that toggles drawing RSML on the thumbnails
// filteranalysed = bool that toggles if the filter bar only displays files with RSML present
// apiAddress/Key = Address/port and key used for the API connection
// apiStatus      = is the API up or not -- these are here due to the gallery reducer handling config, which also handles the API, so it's easier to keep them together in one reducer
// apiModal       = determines if the API settings modal is open or not
// apiAuth        = Is our authentication ok? Assumes yes. Used for the server indicator colours/text as well as a backend check.
// files         = represents all files loaded into state as an object of objects of objects
//              Files are indexed by their parent folder's full path, and then by the file base name, not including the extension
//              The actual file object contains extension: bool pairs that represent if the file name+ext exists
//              This allows for easy adding to the structure when we start dealing with async API calls that result in filesystem changes
//              Also contained is an extension+Thumb: object containing the data buffer for the thumbnail for each image extension
//              So each folder is an object that contains objects for each of its files:
//              files: { folderName: { file1: {rsml: true, png: true}, file2: {} }, folder2:{ file1: {}, file2: {png: true} } }
//              This ensures the full file system can be reconstructed from the concatenated keys.
//              if folder C:\Andrew\Desktop\RootNav has file object wheat_test2: { rsml: true, png: true, pngThumb: {} }
//              Then C:\Andrew\Desktop\RootNav\wheat_test2.rsml and .png exist, which a thumbnail for that png

/*
Full example of state:

state: {
    gallery: {
        folders: [ 
            { path: "C:\Users\Andrew\Desktop\hkj", model: "wheat_bluepaper", active: true }, 
            { path: "C:\Users\Andrew\Desktop\experiments", model: "arabidopsis_plate", active: false }
        ],
        modal: false,
        modalBody: [{
            name: hkg, path: "C:\Users\Andrew\Desktop", children: [{name: ".vs", path: "..."}, {name: "output", path: "..."}] 
        }],
        hasReadConfig: true,
        checked: [],
        filterText: "",
        filterAnalysed: false,
        labels: true,
        apiAddress: "https://xavier.cs.nott.ac.uk:8841",
        apiKey: "dkfskisfg;lleslfds/fesf",
        apiStatus: true
        architecture: true,
        files: {
            C:\Users\Andrew\Desktop\hkj: {
                arch: {
                    txt: true
                },
                heatMap: {
                    png: true,
                    pngThumb: { type: "Buffer", data: [137, 80, 12, 72.....] }
                },
                INEW_exp2,128,LN,1225,249: {
                    png: true,
                    rsml: true,
                    txt: true, 
                    pngThumb: { type: "Buffer", data: [137, 80, 12, 72.....] },
                    parsedRSML: { rsmlJson: {}, polylines: [[{}, {}], [{}, {}]]},
                    _C1: true,
                    _C2: true
                },
                RS2,5,27,testset: {
                    png: true,
                    rsml: true,
                    txt: true,
                    pngThumb: { type: "Buffer", data: [137, 80, 12, 72.....] }
                }
            } 
        }
    }
}
*/