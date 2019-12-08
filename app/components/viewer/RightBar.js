// @flow
import React, { Component } from 'react';
import { Card } from 'react-bootstrap';
import PluginGroup from './PluginGroup';
import { StyledCard } from './StyledComponents'

type Props = {};

export default class RightBar extends Component<Props> {
  props: Props;

  render() {
    const x = ["what", "the", "fuck","did","you","just","say","about","me"];
    return (
      <StyledCard>
        <Card.Header>Test1</Card.Header>
        {
          x.map((item, i) => {
              return <PluginGroup key={i} groupName={item} />;
          })
        }
         <Card.Header>Test2</Card.Header>
        {
          x.map((item, i) => {
              return <PluginGroup key={i} groupName={item} />;
          })
        }
      </StyledCard>
    );
  }
}
