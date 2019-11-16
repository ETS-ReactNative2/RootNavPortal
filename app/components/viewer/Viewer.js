// @flow
import React, { Component } from 'react';
import TopBar from './TopBar';

type Props = {};

export default class Viewer extends Component<Props> {
  props: Props;

  render() {

    return (
      <div data-tid="container">
          <TopBar path={this.props.path}/>
      </div>
    );
  }
}
