import { connect } from 'react-redux';
import FolderChecklist from '../../viewer/FolderChecklist';

const mapStateToProps = (state, ownProps) => ({
    folders: state.gallery.folders
});


export default connect(mapStateToProps, null)(FolderChecklist)