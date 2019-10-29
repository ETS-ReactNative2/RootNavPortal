// @flow
import React, { Component } from 'react';
import FolderView from '../containers/FolderViewContainer';
import styled from 'styled-components';

type Props = {};

export default class GalleryView extends Component<Props> {
  props: Props;

  render() {
    const { folders } = this.props;

    return (
      <div className={"container"} data-tid="container">
        <div className={"title"}>
          <h1>Open Folders</h1>
        </div>
        <div>
          {
            folders.map((item, i) => {
              if (folders.length > 0)
                return <FolderView key={item} folder={item} eventKey={i} />;
            })
          }
        </div>
      </div>
    );
  }
}