// @flow
import React, { Component } from 'react';
import { StyledTopBarDiv, StyledTopBarHR } from '../CommonStyledComponents'
import LeftButton from '../buttons/viewer/LeftButton';
import RightButton from '../buttons/viewer/RightButton';
import ToggleFolderButton from '../buttons/viewer/ToggleFolderButton';
import ToggleMeasuresButton from '../buttons/viewer/ToggleMeasuresButton';
import ResetChangesButton from '../containers/viewer/ResetButtonContainer';
import SaveRSMLButton from '../containers/viewer/SaveButtonContainer';
import UndoChangesButton from '../containers/viewer/UndoButtonContainer';
import { StyledRow } from './StyledComponents';
import { matchPathName } from '../../constants/globals';

export default class TopBar extends Component {

  render() {
    const { path, buttonHandler } = this.props;
    let tag = path ? matchPathName(path)[2] : ""; //Matches the file path into the absolute directory path and file name
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
            <LeftButton click={buttonHandler}/>
            <RightButton click={buttonHandler}/>
            <ToggleMeasuresButton />
            <div className="custom-control custom-checkbox">
                <input type="checkbox" className="custom-control-input" id="architecture" defaultChecked={true} onClick={this.props.toggleArch}/>
                <label className="custom-control-label" htmlFor="architecture">Architecture</label>
            </div>
            <div className="custom-control custom-checkbox">
                <input type="checkbox" className="custom-control-input" id="segMasks" onClick={this.props.toggleSegMasks}/>
                <label className="custom-control-label" htmlFor="segMasks">Segmentation Masks</label>
            </div>
            <ResetChangesButton />
            <UndoChangesButton />
            <SaveRSMLButton path={path} />
        </StyledTopBarDiv>
      </div>
    );
  }
}
