import { connect } from 'react-redux';
import SaveButton from '../../buttons/viewer/SaveRSMLButton';
import { saveRSML, resetEditStack } from '../../../actions/viewerActions';
import { updateFile } from '../../../actions/galleryActions';
import { matchPathName } from '../../../constants/globals';

const mapStateToProps = (state, ownProps) => {
    let viewer =  state.viewer.viewers[process.pid];
    const { path, fileName }  = matchPathName(ownProps.path);
    return {
        parsedRSML: path && fileName ? state.gallery.files[path][fileName].parsedRSML : null,
        editStack: viewer ? viewer.editStack : false,
        path: ownProps.path
    }
};

const mapDispatchToProps = dispatch => ({
    saveRSML: (path, newRSML) => dispatch(saveRSML(path, newRSML)),
    resetEditStack: () => dispatch(resetEditStack(process.pid)),
    updateFile: (folder, fileName, newData) => dispatch(updateFile(folder, fileName, newData))
});

export default connect(mapStateToProps, mapDispatchToProps)(SaveButton)