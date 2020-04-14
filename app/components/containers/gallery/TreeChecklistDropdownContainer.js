import { connect } from 'react-redux';
import TreeChecklistDropdown from '../../gallery/TreeChecklistDropdown';
import { updateChecklistDropdown } from '../../../actions/galleryActions';

const mapStateToProps = (state, ownProps) => ({
    apiModels: state.backend.apiModels
});

const mapDispatchToProps = dispatch => ({ 
    updateChecklistDropdown: (path, model) => dispatch(updateChecklistDropdown(path, model)) ,
});

export default connect(mapStateToProps, mapDispatchToProps)(TreeChecklistDropdown)