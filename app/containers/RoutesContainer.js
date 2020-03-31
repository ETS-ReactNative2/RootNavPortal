import { connect } from 'react-redux';
import Routes from '../Routes';
import { saveAPISettings, updateAPIModal } from '../actions/galleryActions';

const mapStateToProps = state => (
    { 
        address: state.gallery.apiAddress,
        apiKey: state.gallery.apiKey,
        folders: state.gallery.folders,
        apiStatus: state.gallery.apiStatus,
        apiModal: state.gallery.apiModal
    }
);

const mapDispatchToProps = dispatch => ({ 
    saveAPISettings: (address, key) => dispatch(saveAPISettings(address, key)),
    updateAPIModal: bool => dispatch(updateAPIModal(bool))
});

export default connect(mapStateToProps, mapDispatchToProps)(Routes)