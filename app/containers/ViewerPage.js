// @flow
import React, { Component } from 'react';
import Viewer from '../components/containers/viewer/ViewerContainer';
type Props = {};

export default class ViewerPage extends Component<Props> {
  props: Props;

  render() {
    return (
      <div>
        <Viewer path={this.props.path} exts={this.props.exts}/>
      </div>
    )
  }
}
