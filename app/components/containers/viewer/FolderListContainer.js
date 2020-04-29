import { connect } from 'react-redux';
import FolderChecklist from '../../viewer/FolderChecklist';
import { updateChecked, updateViewerFilter } from '../../../actions/viewerActions';

const mapStateToProps = (state, ownProps) => ({
    folders: state.gallery.folders,
    files: state.gallery.files
});

const mapDispatchToProps = dispatch => ({
    updateChecked: checked => dispatch(updateChecked(process.pid, checked)),
    updateViewerFilter: text => dispatch(updateViewerFilter(process.pid, text))
});


export default connect(mapStateToProps, mapDispatchToProps)(FolderChecklist)