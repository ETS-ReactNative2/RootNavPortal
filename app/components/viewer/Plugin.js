// @flow
import React, { Component } from 'react';
import { StyledListGroupItem } from './StyledComponents'

export default class Plugin extends Component {
  render() {
    const { name, active } = this.props;
    return (
        <StyledListGroupItem action variant={active ? 'success' : 'light'}>
            {name}
        </StyledListGroupItem>
    );
  }
}
