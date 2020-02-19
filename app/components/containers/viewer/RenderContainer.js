import { connect } from 'react-redux';
import Render from '../../viewer/Render';
import { updateParsedRSML, updateFile } from '../../../actions/galleryActions'; //still in the gallery state since we're building on the file cache, owned by that reducer. :hmm:
import { matchPathName } from '../../../constants/globals';
import { pushEditStack } from '../../../actions/viewerActions';

const mapStateToProps = (state, ownProps) => {
    let match  = matchPathName(ownProps.path);
    let viewer =  state.viewer.viewers[process.pid];
    return { 
        path: ownProps.path,
        file: state.gallery.files[match[1]][match[2]],
        architecture:  viewer ? viewer.architecture : false, //These prevent errors when unloading the viewer, since the action updates children before the process actually ends
        segMasks: viewer ? viewer.segMasks : false,
        editStack: viewer ? viewer.editStack : false
    }
};

const mapDispatchToProps = dispatch => ({
    updateFile: (folder, fileName, newExts) => dispatch(updateFile(folder, fileName, newExts)),
    updateParsedRSML: (folder, fileName, parsedRSML) => dispatch(updateParsedRSML(folder, fileName, parsedRSML)),
    pushEditStack: lines => dispatch(pushEditStack(process.pid, lines))
    //This expects parsedRSML as {JSON_RSML, polyLine_RSML}
});

export default connect(mapStateToProps, mapDispatchToProps)(Render)