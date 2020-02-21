import { connect } from 'react-redux';
import SaveButton from '../../buttons/viewer/SaveRSMLButton';
import { saveRSML } from '../../../actions/viewerActions';
import { matchPathName } from '../../../constants/globals';

const mapStateToProps = (state, ownProps) => {
    let viewer =  state.viewer.viewers[process.pid];
    let match  = matchPathName(ownProps.path);
    return {
        parsedRSML: state.gallery.files[match[1]][match[2]].parsedRSML,
        editStack: viewer ? viewer.editStack : false,
        path: ownProps.path
    }
};

const mapDispatchToProps = dispatch => ({
    saveRSML: (path, newRSML) => dispatch(saveRSML(path, newRSML))
});

export default connect(mapStateToProps, mapDispatchToProps)(SaveButton)