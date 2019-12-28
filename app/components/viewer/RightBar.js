// @flow
import React, { Component } from 'react';
import { Card } from 'react-bootstrap';
import PluginGroup from './PluginGroup';
import { StyledCard, StyledCardHeader } from './StyledComponents'

type Props = {};

export default class RightBar extends Component<Props> {
  props: Props;

  render() {
    const x = ["Measurement1", "Measurement2", "Measurement3", "Measurement4", "Measurement5", "Measurement6", "Measurement7", "Measurement8"];
    return (
        <StyledCard>
          <StyledCardHeader>Plant Measurements</StyledCardHeader>
          {
            x.map((item, i) => {
                return <PluginGroup key={i} groupName={item} />;
            })
          }
          <StyledCardHeader>Root Measurements</StyledCardHeader>
          {
            x.map((item, i) => {
                return <PluginGroup key={i} groupName={item} />;
            })
          }
        </StyledCard>
    );
  }
}
