import { connect } from 'react-redux';
import Button from '../../buttons/gallery/SettingsButton'
import { updateFolderModel } from '../../../actions/galleryActions';

const mapStateToProps = (state, ownProps) => ({ 
    path: ownProps.path,
    folders: state.gallery.folders,
    apiAddress: state.gallery.apiAddress,
    apiKey: state.gallery.apiKey,
    apiModels: state.backend.apiModels
});

const mapDispatchToProps = dispatch => (
    { updateFolderModel: (path, model) => dispatch(updateFolderModel(path, model)) }
);

export default connect(mapStateToProps, mapDispatchToProps)(Button)