import { connect } from 'react-redux';
import Button from '../buttons/RemoveButton'
import { remove } from '../../actions/galleryActions';

const mapStateToProps = (state, ownProps) => (
    { 
        path: ownProps.path
    }
);

const mapDispatchToProps = dispatch => (
    { remove: (path) => dispatch(remove(path)) }
);

export default connect(mapStateToProps, mapDispatchToProps)(Button)