// @flow
import React, { Component } from 'react';
import { StyledTopBarDiv, StyledTopBarHR } from '../CommonStyledComponents'
import LeftButton from '../buttons/viewer/LeftButton';
import RightButton from '../buttons/viewer/RightButton';
import ToggleFolderButton from '../buttons/viewer/ToggleFolderButton';
import ToggleMeasuresButton from '../buttons/viewer/ToggleMeasuresButton';

type Props = {};

export default class TopBar extends Component<Props> {
  props: Props;

  render() {
      const { path } = this.props;
    return (
      <div>
        <StyledTopBarDiv className="d-inline-flex container" data-tid="container">
            <div className="row" style={{display: 'block'}}>
                <span className="col-sm">Date:</span>
                <span className="col-sm">Tag: {path.substring(path.lastIndexOf('\\')+1, path.indexOf('.'))}</span>
                <span className="col-sm">Number of Plants:</span>
                <span className="col-sm">Captured On:</span>
            </div>
        </StyledTopBarDiv>
        <StyledTopBarHR/>
        <StyledTopBarDiv className="d-inline-flex container" data-tid="container">
            <ToggleFolderButton />
            <LeftButton />
            <RightButton />
            <ToggleMeasuresButton />
            <div className="custom-control custom-checkbox">
                <input type="checkbox" className="custom-control-input" id="architecture"/>
                <label className="custom-control-label" htmlFor="architecture">Architecture</label>
            </div>
            <div className="custom-control custom-checkbox">
                <input type="checkbox" className="custom-control-input" id="segMasks"/>
                <label className="custom-control-label" htmlFor="segMasks">Segmentation Masks</label>
            </div>
        </StyledTopBarDiv>
      </div>
    );
  }
}
