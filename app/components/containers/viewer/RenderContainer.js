import { connect } from 'react-redux';
import Render from '../../viewer/Render';

const mapStateToProps = (state, ownProps) => {
    let r = ownProps.path.match(/(.+\\|\/)(.+)/);
    console.log(r);
    console.log(state.gallery.files)
    return { 
        path: ownProps.path,
        parsedRSML: state.gallery.files[r[1].slice(0, -1)][r[2]]
    }
};

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Render)