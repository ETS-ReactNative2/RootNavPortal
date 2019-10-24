import { connect } from 'react-redux';
import TreeChecklist from '../gallery/TreeChecklist';
import { remove } from '../../actions/galleryActions';

const mapStateToProps = state => (
    { tree: state.gallery.modalBody }
);

const mapDispatchToProps = dispatch => (
    {  }
);

export default connect(mapStateToProps, mapDispatchToProps)(TreeChecklist)