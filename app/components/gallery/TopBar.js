// @flow
import React, { Component } from 'react';
import AddButton from '../containers/gallery/AddButtonContainer';
import RefreshButton from '../containers/gallery/RefreshButtonContainer';
import FilterBar from '../containers/gallery/FilterBarContainer'
import { StyledTopBarDiv, StyledTopBarHR } from '../CommonStyledComponents'
import styled from 'styled-components';

export default class TopBar extends Component {
  labelDiv = styled.div(`
    margin: auto 0 auto 1em;
  `);

  render() {
    return (
      <div>
        <StyledTopBarDiv className="d-inline-flex" data-tid="container">
          <AddButton />
          <RefreshButton />
          <FilterBar/>
          <this.labelDiv className="custom-control custom-checkbox" style={{margin: 'auto 0 auto 1em'}}>
              <input type="checkbox" className="custom-control-input" id="labels" defaultChecked={true} onClick={this.props.toggleLabels}/>
              <label className="custom-control-label" htmlFor="labels">Display Names</label>
          </this.labelDiv>
        </StyledTopBarDiv>
        <StyledTopBarHR/>
      </div>
    );
  }
}
