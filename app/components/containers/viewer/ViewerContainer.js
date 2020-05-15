import { connect } from 'react-redux';
import Viewer from '../../viewer/Viewer';
import { addViewer, removeViewer, resetEditStack } from '../../../actions/viewerActions';

const mapStateToProps = (state, ownProps) => { 
    let viewer =  state.viewer.viewers[process.pid];
    return {
        path: ownProps.path,
        exts: ownProps.exts,
        files: state.gallery.files,
        editStack: viewer ? viewer.editStack : false,
        filterText: viewer ? viewer.filterText : "",
        filterMode: viewer ? viewer.filterMode : false
    }
};

const mapDispatchToProps = dispatch => ({
    addViewer:      () => dispatch(addViewer(process.pid)),
    removeViewer:   () => dispatch(removeViewer(process.pid)),
    resetEditStack: () => dispatch(resetEditStack(process.pid))
});

export default connect(mapStateToProps, mapDispatchToProps)(Viewer)