import { connect } from 'react-redux';
import TopBar from '../../viewer/TopBar';
import { toggleArch, toggleSegMasks } from '../../../actions/viewerActions';
import { setFailedState} from '../../../actions/galleryActions';
import { matchPathName } from '../../../constants/globals';

const mapStateToProps = (state, ownProps) => {
    let viewer =  state.viewer.viewers[process.pid];
    const { path, fileName }  = matchPathName(ownProps.path);
    return {
        buttonHandler: ownProps.buttonHandler,
        path: ownProps.path,
        plants: ownProps.plants,
        segMasks: viewer ? viewer.segMasks : false,
        files: state.gallery.files,
        file: path && fileName ? state.gallery.files[path][fileName] : null,
    };
};

const mapDispatchToProps = dispatch => ({
    toggleArch: () => dispatch(toggleArch(process.pid)),
    toggleSegMasks: () => dispatch(toggleSegMasks(process.pid)),
    setFailedState: (folder, fileName, failedState) => dispatch(setFailedState(folder, fileName, failedState))
});

export default connect(mapStateToProps, mapDispatchToProps)(TopBar)