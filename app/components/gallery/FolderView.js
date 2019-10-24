// @flow
import React, { Component } from 'react';

type Props = {};

export default class FolderView extends Component<Props> {
  props: Props;

  render() {
    const { folder } = this.props;
    console.log("FolderView component " + folder);
    return (
      <div data-tid="container">
          Hello from {folder}!
      </div>
    );
  }
}
