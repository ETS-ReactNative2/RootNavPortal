import { connect } from 'react-redux';
import GalleryView from '../gallery/GalleryView';
import { remove } from '../../actions/galleryActions';

const mapStateToProps = state => (
    { folders: state.gallery.folders }
);

const mapDispatchToProps = dispatch => (
    { remove: () => dispatch(remove()) }
);

export default connect(mapStateToProps, mapDispatchToProps)(GalleryView)