// @flow
import React, { Component } from 'react';
import TopBar from './TopBar';
import { StyledListGroupItem } from './StyledComponents'

type Props = {};

export default class PluginGroup extends Component<Props> {
  props: Props;

  render() {
    const { groupName } = this.props;
    return (
        <StyledListGroupItem>
          Hello from {groupName}!
      </StyledListGroupItem>
    );
  }
}
