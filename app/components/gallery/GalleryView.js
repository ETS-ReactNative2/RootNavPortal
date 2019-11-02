// @flow
import React, { Component } from 'react';
import FolderView from '../containers/FolderViewContainer';
import styled from 'styled-components';

type Props = {};

export default class GalleryView extends Component<Props> {
  props: Props;

  render() {
    const { folders, toggleOpenFile } = this.props;

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

    const StyledHR = styled.hr` && {
      border: 1.2px solid black;
			border-radius: 1em;
			margin: 0 4em;
    }`;


    return (
      <div data-tid="container">
        <div className={"title"}>
          <StyledH1>Open Folders</StyledH1>
        </div>
        <StyledHR/>
        <StyledDiv>
          {
            folders.map((item, i) => {
              console.log(item);
              if (folders.length > 0)
                return <div onClick={() => toggleOpenFile(item.path)}><FolderView key={item} folder={item.path} eventKey={i} isActive={item.active} /></div>;
            })
          }
        </StyledDiv>
      </div>
    );
  }
}