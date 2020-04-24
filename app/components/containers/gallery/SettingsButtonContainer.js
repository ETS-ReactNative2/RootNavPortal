import { connect } from 'react-redux';
import Button from '../../buttons/gallery/SettingsButton'
import { updateFolderModel, removeFiles } from '../../../actions/galleryActions';

const mapStateToProps = (state, ownProps) => ({ 
    path: ownProps.path,
    folders: state.gallery.folders,
    apiAddress: state.gallery.apiAddress,
    apiKey: state.gallery.apiKey,
    apiModels: state.backend.apiModels,
    apiStatus: state.gallery.apiStatus,
    files: state.gallery.files[ownProps.path]
});

const mapDispatchToProps = dispatch => ({ 
    updateFolderModel: (path, model) => dispatch(updateFolderModel(path, model)),
    removeFiles: (folder, fileNames) => dispatch(removeFiles(folder, fileNames))
});

export default connect(mapStateToProps, mapDispatchToProps)(Button)