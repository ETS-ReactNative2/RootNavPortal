import { connect } from 'react-redux';
import Viewer from '../../viewer/Viewer';

const mapStateToProps = (state, ownProps) => {
    return { 
        path: ownProps.path,
        exts: ownProps.exts,
        files: state.gallery.files
    }
};

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Viewer)