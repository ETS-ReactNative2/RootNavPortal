import { connect } from 'react-redux';
import RefreshButton from '../../buttons/gallery/RefreshButton';
import { refreshFiles, addFiles, addThumb } from '../../../actions/galleryActions';

const mapStateToProps = (state, ownProps) => (
    { 
        files: state.gallery.files,
        folders: state.gallery.folders,
        thumbs: state.gallery.thumbs
    }
);

const mapDispatchToProps = dispatch => (
    { 
        refreshFiles: files => dispatch(refreshFiles(files)),
        addFiles: (folder, files) => dispatch(addFiles(folder, files)),
        addThumbs: thumbs => dispatch(addThumb(thumbs))
    }
);

export default connect(mapStateToProps, mapDispatchToProps)(RefreshButton)