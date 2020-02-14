import { connect } from 'react-redux';
import Button from '../../buttons/gallery/AddButton'
import { addFolders, showModal, closeModal, updateModal, updateChecked } from '../../../actions/galleryActions';

const mapStateToProps = (state, ownProps) => (
    { 
        folders: state.gallery.folders,
        modal: state.gallery.modal,
        imports: state.gallery.checked,
        
    }
);

const mapDispatchToProps = dispatch => (
    { 
        closeModal: () => dispatch(closeModal()),
        showModal:  () => dispatch(showModal()),
        addFolders: folderInfo => dispatch(addFolders(folderInfo)),
        updateModalBody: tree => dispatch(updateModal(tree)),
        clearChecked: () => dispatch(updateChecked([]))
    }
);

export default connect(mapStateToProps, mapDispatchToProps)(Button)