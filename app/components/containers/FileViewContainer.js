import { connect } from 'react-redux';
import FileView from '../gallery/FileView';
import { remove } from '../../actions/galleryActions';

const mapStateToProps = state => (
    { folders: state.gallery.folders }
);

const mapDispatchToProps = dispatch => (
    { remove: () => dispatch(remove()) }
);

export default connect(mapStateToProps, mapDispatchToProps)(FileView)