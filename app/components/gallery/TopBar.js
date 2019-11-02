// @flow
import React, { Component } from 'react';
import AddButton from '../containers/AddButtonContainer';
import RefreshButton from '../containers/RefreshButtonContainer';
import ClearButton from '../buttons/ClearButton';
import FilterBar from '../containers/FilterBarContainer'
import DateRange from './DateRange';
import { StyledTopBarDiv, StyledTopBarHR } from './StyledComponents'

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
          <DateRange />
          <ClearButton />
        </StyledTopBarDiv>
        <StyledTopBarHR/>
      </div>
    );
  }
}
