import { connect } from 'react-redux';
import FolderView from '../gallery/FolderView';
import { addFiles } from '../../actions/galleryActions';

const mapStateToProps = (state, ownProps) => (
    { 
        files: state.gallery.files[ownProps.folder],
        key: ownProps.key,
        folder: ownProps.folder,
        filterText: state.gallery.filterText        
    }
);

const mapDispatchToProps = dispatch => (
    { 
        addFiles: (folder, files) => dispatch(addFiles(folder, files))
    }
);

export default connect(mapStateToProps, mapDispatchToProps)(FolderView)