import { connect } from 'react-redux';
import TopBar from '../../gallery/TopBar';
import { toggleLabels, toggleArch } from '../../../actions/galleryActions';

const mapDispatchToProps = dispatch => ({ 
    toggleLabels: () => dispatch(toggleLabels()),
    toggleArch: () => dispatch(toggleArch())
});

export default connect(null, mapDispatchToProps)(TopBar)