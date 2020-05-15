import { connect } from 'react-redux';
import TreeChecklistDropdown from '../../gallery/TreeChecklistDropdown';

const mapStateToProps = (state, ownProps) => ({
    apiModels: state.backend.apiModels,
    folders: state.gallery.folders
});

const mapDispatchToProps = dispatch => ({ 
});

export default connect(mapStateToProps, mapDispatchToProps)(TreeChecklistDropdown)