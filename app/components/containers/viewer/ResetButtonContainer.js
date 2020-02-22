import { connect } from 'react-redux';
import ResetButton from '../../buttons/viewer/ResetChangesButton';
import { resetEditStack } from '../../../actions/viewerActions';

const mapStateToProps = (state, ownProps) => {
   let viewer =  state.viewer.viewers[process.pid];
   return {
        editStack: viewer ? viewer.editStack : false
   }
};

const mapDispatchToProps = dispatch => ({
   resetEditStack: () => dispatch(resetEditStack(process.pid))
});

export default connect(mapStateToProps, mapDispatchToProps)(ResetButton)