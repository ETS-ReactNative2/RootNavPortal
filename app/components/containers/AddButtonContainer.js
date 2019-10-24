import { connect } from 'react-redux';
import Button from '../buttons/AddButton'
import { add, refresh } from '../../actions/galleryActions';

const mapStateToProps = (state, ownProps) => (
    { 
        folders: state.gallery.folders,
        variant: ownProps.variant,
        icon: ownProps.icon 
    }
);

const mapDispatchToProps = dispatch => (
    { refresh: () => dispatch(refresh()),
      add: (path) => dispatch(add(path)) }
);

export default connect(mapStateToProps, mapDispatchToProps)(Button)