import { connect } from 'react-redux';
import TopBar from '../../viewer/TopBar';
import { toggleArch, toggleSegMasks } from '../../../actions/viewerActions';

const mapStateToProps = (state, ownProps) => ({
    buttonHandler: ownProps.buttonHandler,
    path: ownProps.path
});

const mapDispatchToProps = dispatch => ({
    toggleArch: () => dispatch(toggleArch(process.pid)),
    toggleSegMasks: () => dispatch(toggleSegMasks(process.pid))
});

export default connect(mapStateToProps, mapDispatchToProps)(TopBar)