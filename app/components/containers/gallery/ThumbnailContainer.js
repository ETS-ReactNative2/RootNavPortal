import { connect } from 'react-redux';
import Thumbnail from '../../gallery/Thumbnail';
import { addThumb } from '../../../actions/galleryActions';

const mapStateToProps = (state, ownProps) => (
    { 
        file: state.gallery.files[ownProps.folder][ownProps.fileName],
        folder: ownProps.folder,
        fileName: ownProps.fileName,
        queue: state.backend.queue,
        inFlight: state.backend.inFlight,
        labels: state.gallery.labels
    }
);

const mapDispatchToProps = dispatch => (
    { }
);

export default connect(mapStateToProps, mapDispatchToProps)(Thumbnail)