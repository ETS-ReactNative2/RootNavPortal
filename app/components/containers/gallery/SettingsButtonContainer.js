import { connect } from 'react-redux';
import Button from '../../buttons/gallery/SettingsButton'
import { updateModel } from '../../../actions/galleryActions';

const mapStateToProps = (state, ownProps) => (
    { 
        path: ownProps.path,
    }
);

const mapDispatchToProps = dispatch => ({}
    // { updateModel: path => dispatch(updateModel(path)) }
);

export default connect(mapStateToProps, mapDispatchToProps)(Button)