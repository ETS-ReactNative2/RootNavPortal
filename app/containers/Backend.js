import { connect } from 'react-redux';
import Backend from '../Backend';
import { updateFile, resetFolder, updateParsedRSML, addThumb, updateAPIStatus, updateAPIAuth } from '../actions/galleryActions';
import { addQueue, removeQueue, addInflight, removeInflight, updateModels, resetQueues } from '../actions/backendActions';

const mapStateToProps = (state, ownProps) => ({ 
    files: state.gallery.files,
    folders: state.gallery.folders,
    apiAddress: state.gallery.apiAddress,
    apiKey: state.gallery.apiKey,
    apiStatus: state.gallery.apiStatus,
    apiModels: state.backend.apiModels,
    apiAuth: state.gallery.apiAuth,
});

//Follows the form ("path/folder", "file_tag_flower", {rsml: true, seg_p: true, seg_l: true})
const mapDispatchToProps = dispatch => ({
    updateFile: (folder, file, newExts) => dispatch(updateFile(folder, file, newExts)),
    resetFolder: (folder, newState) => dispatch(resetFolder(folder, newState)),
    addQueue: path    => dispatch(addQueue(path)),
    removeQueue: path => dispatch(removeQueue(path)),
    addInflight: file => dispatch(addInflight(file)),
    removeInflight: file => dispatch(removeInflight(file)),
    updateParsedRSML: newFiles => dispatch(updateParsedRSML(newFiles)),
    addThumb: thumbs => dispatch(addThumb(thumbs)),
    updateAPIStatus: status => dispatch(updateAPIStatus(status)),
    updateAPIModels: apiModels => dispatch(updateModels(apiModels)),
    updateAPIAuth: auth => dispatch(updateAPIAuth(auth)),
    resetQueues: () => dispatch(resetQueues())
});

export default connect(mapStateToProps, mapDispatchToProps)(Backend)