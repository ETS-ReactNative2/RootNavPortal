import { connect } from 'react-redux';
import Routes from '../Routes';
import { saveAPISettings } from '../actions/galleryActions';

const mapStateToProps = state => (
    { 
        address: state.gallery.apiAddress,
        apiKey: state.gallery.apiKey,
        folders: state.gallery.folders,
        apiStatus: state.gallery.apiStatus
    }
);

const mapDispatchToProps = dispatch => (
    { saveAPISettings: (address, key) => dispatch(saveAPISettings(address, key)) }
);

export default connect(mapStateToProps, mapDispatchToProps)(Routes)