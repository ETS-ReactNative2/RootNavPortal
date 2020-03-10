// @flow
import React, { Component } from 'react';
import Viewer from '../components/containers/viewer/ViewerContainer';

export default class ViewerPage extends Component {
    render() {
        return (
            <div>
                <Viewer path={this.props.path} exts={this.props.exts}/>
            </div>
        )
    }
}
