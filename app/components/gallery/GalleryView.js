// @flow
import React, { Component } from 'react';
import FolderView from '../containers/FolderViewContainer';
import { StyledHR, StyledGalleryViewDiv, StyledGalleryViewH1 } from './StyledComponents'


type Props = {};

export default class GalleryView extends Component<Props> {
  props: Props;

  render() {
    const { folders, toggleOpenFile } = this.props;
    return (
      <div data-tid="container">
        <div className={"title"}>
          <StyledGalleryViewH1>Open Folders</StyledGalleryViewH1>
        </div>
        <StyledHR/>
        <StyledGalleryViewDiv>
          {
            folders.map((item, i) => {
              if (folders.length > 0)
                return <div key={item} onClick={() => toggleOpenFile(item.path)}><FolderView folder={item.path} key={i} isActive={item.active} /></div>;
            })
          }
        </StyledGalleryViewDiv>
      </div>
    );
  }
}