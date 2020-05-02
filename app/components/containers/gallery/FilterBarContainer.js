import { connect } from 'react-redux';
import FilterBar from '../../gallery/FilterBar';
import { updateFilterText, updateFilterAnalysed } from '../../../actions/galleryActions';

const mapStateToProps = state => (
    { 
        filterAnalysed: state.gallery.filterAnalysed
    }
);

const mapDispatchToProps = dispatch => (
    { 
        updateFilterText: text => dispatch(updateFilterText(text)),
        updateFilterAnalysed: checked => dispatch(updateFilterAnalysed(checked))
    }
);

export default connect(mapStateToProps, mapDispatchToProps)(FilterBar)