// @flow
import React, { Component } from 'react';
import { StyledListGroupItem } from './StyledComponents'

type Props = {};

export default class Plugin extends Component<Props> {
  render() {
    const { name, func, active } = this.props;
    return (
        <StyledListGroupItem action variant={active ? 'success' : 'light'} onClick={func}>
          {name}
      </StyledListGroupItem>
    );
  }
}
