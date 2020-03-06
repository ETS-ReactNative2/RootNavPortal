import { connect } from 'react-redux';
import TopBar from '../../viewer/TopBar';
import { toggleArch, toggleSegMasks } from '../../../actions/viewerActions';

const mapStateToProps = (state, ownProps) => {
    let viewer =  state.viewer.viewers[process.pid];
    return {
        buttonHandler: ownProps.buttonHandler,
        path: ownProps.path,
        plants: ownProps.plants,
        segMasks: viewer ? viewer.segMasks : false,
    };
};

const mapDispatchToProps = dispatch => ({
    toggleArch: () => dispatch(toggleArch(process.pid)),
    toggleSegMasks: () => dispatch(toggleSegMasks(process.pid))
});

export default connect(mapStateToProps, mapDispatchToProps)(TopBar)