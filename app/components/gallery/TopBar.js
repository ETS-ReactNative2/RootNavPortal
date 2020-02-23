// @flow
import React, { Component } from 'react';
import AddButton from '../containers/gallery/AddButtonContainer';
import RefreshButton from '../containers/gallery/RefreshButtonContainer';
import FilterBar from '../containers/gallery/FilterBarContainer'
import { StyledTopBarDiv, StyledTopBarHR } from '../CommonStyledComponents'

export default class TopBar extends Component {
  render() {
    return (
      <div>
        <StyledTopBarDiv className="d-inline-flex" data-tid="container">
          <AddButton />
          <RefreshButton />
          <FilterBar/>
          <div className="custom-control custom-checkbox">
              <input type="checkbox" className="custom-control-input" id="labels" defaultChecked={true} onClick={this.props.toggleLabels}/>
              <label className="custom-control-label" htmlFor="labels">Display Names</label>
          </div>
        </StyledTopBarDiv>
        <StyledTopBarHR/>
      </div>
    );
  }
}
