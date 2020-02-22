import { connect } from 'react-redux';
import TreeChecklistDropdown from '../../gallery/TreeChecklistDropdown';
import { updateChecklistDropdown } from '../../../actions/galleryActions';

const mapDispatchToProps = dispatch => (
    { updateChecklistDropdown: (path, model) => dispatch(updateChecklistDropdown(path, model)) }
);

export default connect(null, mapDispatchToProps)(TreeChecklistDropdown)