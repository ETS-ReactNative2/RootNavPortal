import { connect } from 'react-redux';
import Button from '../../buttons/gallery/RemoveButton'
import { remove } from '../../../actions/galleryActions';

const mapStateToProps = (state, ownProps) => (
    { 
        path: ownProps.path,
        folders: state.gallery.folders,
        apiAddress: state.gallery.apiAddress,
        apiKey: state.gallery.apiKey
    }
);

const mapDispatchToProps = dispatch => (
    { remove: path => dispatch(remove(path)) }
);

export default connect(mapStateToProps, mapDispatchToProps)(Button)