// @flow
import React, { Component } from 'react';
import FolderView from '../containers/FolderViewContainer';
import styled from 'styled-components';

type Props = {};

export default class GalleryView extends Component<Props> {
  props: Props;

  render() {
    const { folders } = this.props;

    const StyledH1 = styled.h1` && {
      margin-left: 1.5em
    }`

    const StyledDiv = styled.div` && {
      position: fixed;
      overflow-y: scroll;
      bottom: 0;
      top: 10em;
      left: 0;
      right: 0;
    }`

    return (
      <div data-tid="container">
        <div className={"title"}>
          <StyledH1>Open Folders</StyledH1>
        </div>
        <StyledDiv>
          {
            folders.map((item, i) => {
              if (folders.length > 0)
                return <FolderView key={item} folder={item} eventKey={i} isActive={false} />;
            })
          }
        </StyledDiv>
      </div>
    );
  }
}