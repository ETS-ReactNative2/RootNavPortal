import { connect } from 'react-redux';
import PluginBar from '../../viewer/PluginBar';

const mapStateToProps = (state, ownProps) => {
    return {
        files: state.gallery.files
    }
};

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(PluginBar)