// @flow
import React, { Component } from 'react';
import FolderView from '../containers/gallery/FolderViewContainer';
import { StyledGalleryViewDiv, StyledGalleryViewH1, StyledFolderCard } from './StyledComponents'


type Props = {};

export default class GalleryView extends Component<Props> {
  props: Props;

  render() {
    const { folders } = this.props;
    return (
      <div data-tid="container">
        <div className={"title"}>
          <StyledGalleryViewH1>Open Folders</StyledGalleryViewH1>
        </div>
        <StyledGalleryViewDiv>
          {
            folders.map((item, i) => {
              if (folders.length > 0)
                return <StyledFolderCard key={i}>
                  <FolderView folder={item.path} isActive={item.active} />
                </StyledFolderCard>;
            })
          }
        </StyledGalleryViewDiv>
      </div>
    );
  }
}