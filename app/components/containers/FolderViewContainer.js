import { connect } from 'react-redux';
import FolderView from '../gallery/FolderView';
import { addFiles } from '../../actions/galleryActions';

const mapStateToProps = (state, ownProps) => (
    { 
        folders: state.gallery.folders,
        files: state.gallery.files,
        key: ownProps.key,
        folder: ownProps.folder,
        eventKey: ownProps.eventKey
    }
);

const mapDispatchToProps = dispatch => (
    { addFiles: (folder, files) => dispatch(addFiles(folder, files)) }
);

export default connect(mapStateToProps, mapDispatchToProps)(FolderView)