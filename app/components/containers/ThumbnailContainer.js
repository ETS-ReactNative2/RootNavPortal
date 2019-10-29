import { connect } from 'react-redux';
import Thumbnail from '../gallery/Thumbnail';
import { addThumb } from '../../actions/galleryActions';

const mapStateToProps = (state, ownProps) => (
    { 
        file: state.gallery.files[ownProps.folder][ownProps.file],
        folder: ownProps.folder,
        fileName: ownProps.file
    }
);

const mapDispatchToProps = dispatch => (
    { addThumb: (folder, fileName, thumb) => dispatch(addThumb(folder, fileName, thumb)) }
);

export default connect(mapStateToProps, mapDispatchToProps)(Thumbnail)