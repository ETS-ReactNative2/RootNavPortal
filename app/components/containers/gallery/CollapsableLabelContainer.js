import { connect } from 'react-redux';
import CollapsableLabel from '../../gallery/CollapsableLabel'

const mapStateToProps = (state, ownProps) => (
    { 
        labels: state.gallery.labels,
    }
);

export default connect(mapStateToProps, null)(CollapsableLabel)