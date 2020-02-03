import { connect } from 'react-redux';
import Viewer from '../../viewer/Viewer';
import { addViewer } from '../../../actions/viewerActions';

const mapStateToProps = (state, ownProps) => ({ 
    path: ownProps.path,
    exts: ownProps.exts,
    files: state.gallery.files
});

const mapDispatchToProps = dispatch => ({
    addViewer: viewerID => dispatch(addViewer(viewerID))
});

export default connect(mapStateToProps, mapDispatchToProps)(Viewer)