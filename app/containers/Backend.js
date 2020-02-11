import { connect } from 'react-redux';
import Backend from '../Backend';
import { updateFile, resetFolder } from '../actions/galleryActions';
import { addQueue, removeQueue, addInflight, removeInflight } from '../actions/backendActions';

const mapStateToProps = (state, ownProps) => ({ 
    files: state.gallery.files,
    inflightFiles: state.backend.inFlight
});

//Follows the form ("path/folder", "file_tag_flower", {rsml: true, seg_p: true, seg_l: true})
const mapDispatchToProps = dispatch => ({
    updateFile: (folder, file, newExts) => dispatch(updateFile(folder, file, newExts)),
    resetFolder: (folder, newState) => dispatch(resetFolder(folder, newState)),
    addQueue: path    => dispatch(addQueue(path)),
    removeQueue: path => dispatch(removeQueue(path)),
    addInflight: file => dispatch(addInflight(file)),
    removeInflight: file => dispatch(removeInflight(file))
});

export default connect(mapStateToProps, mapDispatchToProps)(Backend)