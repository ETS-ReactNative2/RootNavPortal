import { connect } from 'react-redux';
import TopBar from '../../gallery/TopBar';
import { toggleLabels } from '../../../actions/galleryActions';

const mapDispatchToProps = dispatch => ({ 
    toggleLabels: () => dispatch(toggleLabels()) 
});

export default connect(null, mapDispatchToProps)(TopBar)