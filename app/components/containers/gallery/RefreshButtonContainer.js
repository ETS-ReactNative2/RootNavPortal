import { connect } from 'react-redux';
import RefreshButton from '../../buttons/gallery/RefreshButton';
import { refreshFiles } from '../../../actions/galleryActions';

const mapStateToProps = (state, ownProps) => (
    { 
        files: state.gallery.files,
        folders: state.gallery.folders,
    }
);

const mapDispatchToProps = dispatch => (
    { refreshFiles: files => dispatch(refreshFiles(files)) }
);

export default connect(mapStateToProps, mapDispatchToProps)(RefreshButton)