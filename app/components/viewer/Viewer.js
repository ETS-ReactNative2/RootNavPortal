// @flow
import React, { Component } from 'react';
import TopBar from './TopBar';
import RightBar from './RightBar'
import { StyledContainer } from './StyledComponents';
import Render from '../containers/viewer/RenderContainer';
type Props = {};

export default class Viewer extends Component<Props> {
  props: Props;

  render() {
    console.log(this.props);

    return (
      <StyledContainer>
          <TopBar path={this.props.path} />
          <Render path={this.props.path} />
          <RightBar/>
      </StyledContainer>
    );
  }
}
