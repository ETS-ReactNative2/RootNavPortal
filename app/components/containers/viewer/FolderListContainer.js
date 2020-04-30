import { connect } from 'react-redux';
import FolderChecklist from '../../viewer/FolderChecklist';
import { updateChecked, updateViewerFilter } from '../../../actions/viewerActions';

const mapStateToProps = (state, ownProps) => {
    let viewer = state.viewer.viewers[process.pid];
    return {
        folders: state.gallery.folders,
        files: state.gallery.files,
        filterText: viewer ? viewer.filterText : ""
    };
};

const mapDispatchToProps = dispatch => ({
    updateChecked: checked => dispatch(updateChecked(process.pid, checked)),
    updateViewerFilter: text => dispatch(updateViewerFilter(process.pid, text))
});


export default connect(mapStateToProps, mapDispatchToProps)(FolderChecklist)