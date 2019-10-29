// @flow
import React, { Component } from 'react';
import AddButton from '../containers/AddButtonContainer';
import RefreshButton from '../containers/RefreshButtonContainer';
import ClearButton from '../buttons/ClearButton';
import FilterBar from './FilterBar'
import DateRange from './DateRange';
import styled from 'styled-components';

type Props = {};

export default class TopBar extends Component<Props> {
  props: Props;

  render() {
    const StyledHR = styled.hr` && {
      border: 2px solid black;
      margin-left: 50px;
      margin-right: 50px;
      border-radius: 1em;
    }`;

    const StyledDiv = styled.div` && {
      padding-top: 1rem;
      margin-left: 70px;
    }`;

    return (
      <div>
        <StyledDiv className="d-inline-flex" data-tid="container">
          <AddButton />
          <RefreshButton />
          <FilterBar/>
          <DateRange />
          <ClearButton />
        </StyledDiv>
        <StyledHR/>
      </div>
    );
  }
}
