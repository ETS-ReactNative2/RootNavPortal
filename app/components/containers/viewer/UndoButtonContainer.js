import { connect } from 'react-redux';
import UndoButton from '../../buttons/viewer/UndoChangesButton';
import { popEditStack } from '../../../actions/viewerActions';

const mapStateToProps = (state, ownProps) => {
    let viewer =  state.viewer.viewers[process.pid];
    return {
        editStack: viewer ? viewer.editStack : false
    }
};

const mapDispatchToProps = dispatch => ({
   popEditStack: () => dispatch(popEditStack(process.pid))
});

export default connect(mapStateToProps, mapDispatchToProps)(UndoButton)