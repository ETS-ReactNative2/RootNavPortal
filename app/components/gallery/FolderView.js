// @flow
import React, { Component } from 'react';
import RemoveButton from '../containers/RemoveButtonContainer'
import { Accordion, Card } from 'react-bootstrap';

type Props = {};

export default class FolderView extends Component<Props> {
  props: Props;
  
  render() {
    
    const { folder } = this.props;
    return (
      <Card>
        <Accordion.Toggle as={Card.Header} eventKey={this.props.eventKey}>
          Hello from {folder}!
          <RemoveButton path={folder}/>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={this.props.eventKey}>
          <Card.Body>Hello! I'm the body</Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  }
}
