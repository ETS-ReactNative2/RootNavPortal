import { connect } from 'react-redux';
import Gallery from '../components/gallery/Gallery';
import { importConfig } from '../actions/galleryActions';

const mapStateToProps = state => (
    { 
        folders: state.gallery.folders,
        hasReadConfig: state.gallery.hasReadConfig,
        apiAddress: state.gallery.apiAddress,
        apiKey: state.gallery.apiKey
    }
);

const mapDispatchToProps = dispatch => (
    { importConfig: (folders, apiAddress, apiKey) => dispatch(importConfig(folders, apiAddress, apiKey)) }
);

export default connect(mapStateToProps, mapDispatchToProps)(Gallery)