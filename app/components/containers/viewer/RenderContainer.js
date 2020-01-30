import { connect } from 'react-redux';
import Render from '../../viewer/Render';
import { updateParsedRSML } from '../../../actions/galleryActions'; //still in the gallery state since we're building on the file cache, owned by that reducer. :hmm:

const mapStateToProps = (state, ownProps) => {
    let r = ownProps.path.match(/(.+\\|\/)(.+)/);
    return { 
        path: ownProps.path,
        file: state.gallery.files[r[1].slice(0, -1)][r[2]]
    }
};

const mapDispatchToProps = dispatch => ({
    updateParsedRSML: (folder, fileName, parsedRSML) => dispatch(updateParsedRSML(folder, fileName, parsedRSML))
    //This expects parsedRSML as {JSON_RSML, polyLine_RSML}
});

export default connect(mapStateToProps, mapDispatchToProps)(Render)