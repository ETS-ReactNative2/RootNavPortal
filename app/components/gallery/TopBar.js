// @flow
import React, { Component } from 'react';
import AddButton from '../containers/gallery/AddButtonContainer';
import RefreshButton from '../containers/gallery/RefreshButtonContainer';
import FilterBar from '../containers/gallery/FilterBarContainer'
import { StyledTopBarDiv, StyledTopBarHR } from '../CommonStyledComponents'

type Props = {};

export default class TopBar extends Component<Props> {
  props: Props;

  render() {
    return (
      <div>
        <StyledTopBarDiv className="d-inline-flex" data-tid="container">
          <AddButton />
          <RefreshButton />
          <FilterBar/>
        </StyledTopBarDiv>
        <StyledTopBarHR/>
      </div>
    );
  }
}
