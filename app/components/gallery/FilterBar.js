// @flow
import React, { Component } from 'react';
import styled from 'styled-components';

type Props = {};

export default class FilterBar extends Component<Props> {
  props: Props;

  
  render() {

    const StyledSpan = styled.span` && {
      width: 50%;
      margin: auto 0 auto 1em;
    }`

    return (
      <StyledSpan>
        <div className="input-group">
          <input type="text" className="form-control"/>
          <div className="input-group-append">
            <div className="input-group-text">
              <div className="custom-control custom-checkbox">
                <input type="checkbox" className="custom-control-input" id="customCheck"/>
                <label className="custom-control-label" for="customCheck">Analysed</label>
              </div>
            </div>
          </div>
        </div>
      </StyledSpan>
    );
  }
}
