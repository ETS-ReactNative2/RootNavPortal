import { connect } from 'react-redux';
import Gallery from '../components/gallery/Gallery';
import { importConfig } from '../actions/galleryActions';

const mapStateToProps = state => (
    { 
        folders: state.gallery.folders,
        hasReadConfig: state.gallery.hasReadConfig
    }
);

const mapDispatchToProps = dispatch => (
    { importConfig: data => dispatch(importConfig(data)) }
);

export default connect(mapStateToProps, mapDispatchToProps)(Gallery)