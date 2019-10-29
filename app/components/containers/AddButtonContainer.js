import { connect } from 'react-redux';
import Button from '../buttons/AddButton'
import { addFolders, showModal, closeModal, updateModal } from '../../actions/galleryActions';

const mapStateToProps = (state, ownProps) => (
    { 
        folders: state.gallery.folders,
        modal: state.gallery.modal,
        imports: state.gallery.checked
    }
);

const mapDispatchToProps = dispatch => (
    { 
        closeModal: () => dispatch(closeModal()),
        showModal:  () => dispatch(showModal()),
        addFolders: path => dispatch(addFolders(path)),
        updateModalBody: tree => dispatch(updateModal(tree))
    }
);

export default connect(mapStateToProps, mapDispatchToProps)(Button)