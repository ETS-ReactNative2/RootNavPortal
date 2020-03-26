// @flow
import React, { Component } from 'react';
import FolderView from '../containers/gallery/FolderViewContainer';
import { StyledGalleryViewDiv, StyledGalleryViewH1 } from './StyledComponents'

export default class GalleryView extends Component {
    render() {
        const { folders } = this.props;
        return (
            <div data-tid="container">
                <div className={"title"}>
                    <StyledGalleryViewH1>Open Folders</StyledGalleryViewH1>
                </div>
                <StyledGalleryViewDiv>
                {
                    folders.map((item, i) => <FolderView key={i} folder={item.path} isActive={item.active} />)
                }
                </StyledGalleryViewDiv>
            </div>
        );
    }
}