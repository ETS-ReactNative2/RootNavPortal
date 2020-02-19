import { connect } from 'react-redux';
import SaveButton from '../../buttons/viewer/SaveRSMLButton';
import { saveRSML } from '../../../actions/viewerActions';

const mapStateToProps = (state, ownProps) => {
    let viewer =  state.viewer.viewers[process.pid];
    return {
        editStack: viewer ? viewer.editStack : false,
        path: ownProps.path
    }
};

const mapDispatchToProps = dispatch => ({
    saveRSML: (path, newRSML) => dispatch(saveRSML(path, newRSML))
});

export default connect(mapStateToProps, mapDispatchToProps)(SaveButton)