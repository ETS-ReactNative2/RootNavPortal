// @flow
import React, { Component } from 'react';
import styled from 'styled-components';

type Props = {};

export default class FilterBar extends Component<Props> {
  props: Props;

  render() {
    return (
      <span style={{'width': '50%', 'margin': 'auto 0 auto 1em'}}>
        <div className="input-group">
          <input type="text" className="form-control"/>
          <div className="input-group-append">
            <div className="input-group-text">
              <input style={{'margin':'0 5px 0px 0'}} type="checkbox"/>
              Analysed
            </div>
          </div>
        </div>
      </span>
    );
  }
}
