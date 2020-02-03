// @flow
import React, { Component } from 'react';
import { StyledTopBarDiv, StyledTopBarHR } from '../CommonStyledComponents'
import LeftButton from '../buttons/viewer/LeftButton';
import RightButton from '../buttons/viewer/RightButton';
import ToggleFolderButton from '../buttons/viewer/ToggleFolderButton';
import ToggleMeasuresButton from '../buttons/viewer/ToggleMeasuresButton';
import { StyledRow } from './StyledComponents';

type Props = {};

export default class TopBar extends Component<Props> {
  props: Props;

  toggleArch = () => {
      this.props.toggleArch(process.pid);
  }

  toggleSegMasks = () => {
      this.props.toggleSegMasks(process.pid)
  }

  render() {
    const { path } = this.props;
    let tag = path ? path.match(/(.+\\|\/)(.+)/)[2] : ""; //Matches the file path into the absolute directory path and file name
    return (
      <div>
        <StyledTopBarDiv className="d-inline-flex" data-tid="container">
            <StyledRow>
                <div className="col-sm-3">Tag: {tag}</div>
                <div className="col-sm-3">Date:</div>
                <div className="col-sm-3">Number of Plants:</div>
                <div className="col-sm-3">Captured On:</div>
            </StyledRow>
        </StyledTopBarDiv>
        <StyledTopBarHR/>
        <StyledTopBarDiv className="d-inline-flex container" data-tid="container">
            <ToggleFolderButton />
            <LeftButton click={this.props.buttonHandler}/>
            <RightButton click={this.props.buttonHandler}/>
            <ToggleMeasuresButton />
            <div className="custom-control custom-checkbox">
                <input type="checkbox" className="custom-control-input" id="architecture" defaultChecked={true} onClick={this.toggleArch}/>
                <label className="custom-control-label" htmlFor="architecture">Architecture</label>
            </div>
            <div className="custom-control custom-checkbox">
                <input type="checkbox" className="custom-control-input" id="segMasks" onClick={this.toggleSegMasks}/>
                <label className="custom-control-label" htmlFor="segMasks">Segmentation Masks</label>
            </div>
        </StyledTopBarDiv>
      </div>
    );
  }
}
