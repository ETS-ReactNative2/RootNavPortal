import { connect } from 'react-redux';
import GalleryView from '../../gallery/GalleryView';
import { remove, toggleOpenFile } from '../../../actions/galleryActions';

const mapStateToProps = state => (
    { folders: state.gallery.folders }
);

const mapDispatchToProps = dispatch => (
    { 
        remove: () => dispatch(remove()),
        toggleOpenFile: (file) => dispatch(toggleOpenFile(file))
    }
);

export default connect(mapStateToProps, mapDispatchToProps)(GalleryView)