import { connect } from 'react-redux';
import FolderView from '../../gallery/FolderView';
import { addFiles, toggleOpenFile } from '../../../actions/galleryActions';

const mapStateToProps = (state, ownProps) => ({ 
        files: state.gallery.files[ownProps.folder],
        folders: state.gallery.folders,
        folder: ownProps.folder,
        isActive: ownProps.isActive,
        filterText: state.gallery.filterText,
        filterAnalysed: state.gallery.filterAnalysed        
    }
);

const mapDispatchToProps = dispatch => (
    { 
        addFiles: (folder, files) => dispatch(addFiles(folder, files)),
        toggleOpenFile: (file) => dispatch(toggleOpenFile(file))
    }
);

export default connect(mapStateToProps, mapDispatchToProps)(FolderView)