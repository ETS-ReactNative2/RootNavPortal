import { connect } from 'react-redux';
import Render from '../../viewer/Render';
import { updateParsedRSML } from '../../../actions/galleryActions'; //still in the gallery state since we're building on the file cache, owned by that reducer. :hmm:
import { matchPathName } from '../../../constants/globals';

const mapStateToProps = (state, ownProps) => {
    let match = matchPathName(ownProps.path);
    return { 
        path: ownProps.path,
        file: state.gallery.files[match[1]][match[2]],
        architecture: state.viewer.viewers[process.pid].architecture,
        segMasks: state.viewer.viewers[process.pid].segMasks
    }
};

const mapDispatchToProps = dispatch => ({
    updateParsedRSML: (folder, fileName, parsedRSML) => dispatch(updateParsedRSML(folder, fileName, parsedRSML))
    //This expects parsedRSML as {JSON_RSML, polyLine_RSML}
});

export default connect(mapStateToProps, mapDispatchToProps)(Render)