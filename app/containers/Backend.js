import { connect } from 'react-redux';
import Backend from '../Backend';
import { updateFile } from '../actions/galleryActions';

const mapStateToProps = (state, ownProps) => ({ 
    files: state.gallery.files,
});

//Follows the form ("path/folder", "file_tag_flower", {rsml: true, seg_p: true, seg_l: true})
const mapDispatchToProps = dispatch => ({
    updateFile: (folder, file, newExts) => dispatch(updateFile(folder, file, newExts))
});

export default connect(mapStateToProps, mapDispatchToProps)(Backend)