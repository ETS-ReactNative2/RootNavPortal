export const ADD_QUEUE       = 'ADD_QUEUE';
export const REMOVE_QUEUE    = 'REMOVE_QUEUE';
export const ADD_INFLIGHT    = 'ADD_INFLIGHT';
export const REMOVE_INFLIGHT = 'REMOVE_INFLIGHT';
export const UPDATE_MODELS = 'UPDATE_MODELS';

export const addQueue       = path => ({ type: ADD_QUEUE, path }); //Path is the absolute path of the file added, probably without the extension
export const removeQueue    = path => ({ type: REMOVE_QUEUE, path });
export const addInflight    = file => ({ type: ADD_INFLIGHT, file }); //file is an object of struct: {name, model, ext}
export const removeInflight = file => ({ type: REMOVE_INFLIGHT, file });
export const updateModels   = (apiModels, rootNavModel) => ({ type: UPDATE_MODELS, apiModels, rootNavModel });

