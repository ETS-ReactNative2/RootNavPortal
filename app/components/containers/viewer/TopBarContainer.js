import { connect } from 'react-redux';
import TopBar from '../../viewer/TopBar';
import { toggleArch, toggleSegMasks } from '../../../actions/viewerActions';

const mapStateToProps = (state, ownProps) => ({
    buttonHandler: ownProps.buttonHandler,
    path: ownProps.path
});

const mapDispatchToProps = dispatch => ({
    toggleArch: viewerID => dispatch(toggleArch(viewerID)),
    toggleSegMasks: viewerID => dispatch(toggleSegMasks(viewerID))
});

export default connect(mapStateToProps, mapDispatchToProps)(TopBar)