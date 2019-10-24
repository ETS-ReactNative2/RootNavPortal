// @flow
import React, { Component } from 'react';
import RemoveButton from '../containers/RemoveButtonContainer'

type Props = {};

export default class FolderView extends Component<Props> {
  props: Props;

  render() {
    const { folder } = this.props;
    return (
      <div data-tid="container">
          Hello from {folder}!
          <RemoveButton path={folder}/>
      </div>
    );
  }
}
