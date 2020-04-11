import { connect } from 'react-redux';
import Thumbnail from '../../gallery/Thumbnail';

const mapStateToProps = (state, ownProps) => { 
    let folder = state.gallery.folders.find(folder => folder.path == ownProps.folder);
    let thumbContainer = state.gallery.thumbs[ownProps.folder];
    return {
        file: state.gallery.files[ownProps.folder][ownProps.fileName],
        thumb: thumbContainer ? thumbContainer[ownProps.fileName] : null,
        folder: ownProps.folder,
        fileName: ownProps.fileName,
        queue: state.backend.queue,
        inFlight: state.backend.inFlight,
        architecture: state.gallery.architecture,
        active: folder.active,
        model: folder.model,
        apiStatus: state.gallery.apiStatus,
        filterText: state.gallery.filterText
    };
};

const mapDispatchToProps = dispatch => (
    { }
);

export default connect(mapStateToProps, mapDispatchToProps)(Thumbnail);