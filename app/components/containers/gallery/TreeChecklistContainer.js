import { connect } from 'react-redux';
import TreeChecklist from '../../gallery/TreeChecklist';
import { updateChecked } from '../../../actions/galleryActions';

const mapStateToProps = state => (
    { 
        tree: state.gallery.modalBody,
        importedFolders: state.gallery.folders
    }
);

const mapDispatchToProps = dispatch => (
    { updateChecked: paths => dispatch(updateChecked(paths)) }
);

export default connect(mapStateToProps, mapDispatchToProps)(TreeChecklist)