import { connect } from 'react-redux';
import FilterBar from '../gallery/FilterBar';
import { updateFilterText } from '../../actions/galleryActions';

const mapStateToProps = (state, ownProps) => (
    { 
        filterText: state.gallery.filterText,
    }
);

const mapDispatchToProps = dispatch => (
    { updateFilterText: text => dispatch(updateFilterText(text)) }
);

export default connect(mapStateToProps, mapDispatchToProps)(FilterBar)