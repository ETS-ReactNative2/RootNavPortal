import { connect } from 'react-redux';
import FolderChecklist from '../../viewer/FolderChecklist';
import { updateChecked } from '../../../actions/viewerActions';

const mapStateToProps = (state, ownProps) => ({
    folders: state.gallery.folders
});

const mapDispatchToProps = dispatch => ({
    updateChecked: checked => dispatch(updateChecked(process.pid, checked))
});


export default connect(mapStateToProps, mapDispatchToProps)(FolderChecklist)