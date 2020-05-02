import { connect } from 'react-redux';
import TopBar from '../../gallery/TopBar';
import { toggleLabels, toggleArch } from '../../../actions/galleryActions';

const mapStateToProps = state => (
    { 
        labels: state.gallery.labels,
        architecture: state.gallery.architecture,
    }
);

const mapDispatchToProps = dispatch => ({ 
    toggleLabels: () => dispatch(toggleLabels()),
    toggleArch: () => dispatch(toggleArch())
});

export default connect(mapStateToProps, mapDispatchToProps)(TopBar)