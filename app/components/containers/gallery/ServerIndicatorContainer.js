import { connect } from 'react-redux';
import ServerIndicator from '../../buttons/gallery/ServerIndicator';
import { updateAPIModal } from '../../../actions/galleryActions';

const mapStateToProps = (state, ownProps) => (
    { 
        apiAddress: state.gallery.apiAddress,
        apiKey: state.gallery.apiKey,
        apiStatus: state.gallery.apiStatus
    }
);

const mapDispatchToProps = dispatch => ({
    updateAPIModal: bool => dispatch(updateAPIModal(bool))
});

export default connect(mapStateToProps, mapDispatchToProps)(ServerIndicator)