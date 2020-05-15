import { connect } from 'react-redux';
import TreeChecklist from '../../gallery/TreeChecklist';
import { updateChecked } from '../../../actions/galleryActions';
import { updateFolderModelsDropdown } from '../../../actions/galleryActions';

const mapStateToProps = state => (
    { 
        tree: state.gallery.modalBody,
        importedFolders: state.gallery.folders,
        checked: state.gallery.checked,
        folders: state.gallery.folders,
    }
);

const mapDispatchToProps = dispatch => (
    { 
        updateChecked: paths => dispatch(updateChecked(paths)),
        updateFolderModelsDropdown: (paths, model) => dispatch(updateFolderModelsDropdown(paths, model)),
     }
);

export default connect(mapStateToProps, mapDispatchToProps)(TreeChecklist)