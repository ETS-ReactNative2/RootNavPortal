// @flow
import React, { Component } from 'react';
import { StyledTopBarDiv, StyledTopBarHR } from '../CommonStyledComponents'
import LeftButton from '../buttons/viewer/LeftButton';
import RightButton from '../buttons/viewer/RightButton';
import ResetChangesButton from '../containers/viewer/ResetButtonContainer';
import SaveRSMLButton from '../containers/viewer/SaveButtonContainer';
import UndoChangesButton from '../containers/viewer/UndoButtonContainer';
import { StyledRow } from './StyledComponents';
import { matchPathName } from '../../constants/globals';

export default class TopBar extends Component {

  render() {
    const { path, buttonHandler, plants } = this.props;
    let tag = path ? matchPathName(path)[2] : ""; //Matches the file path into the absolute directory path and file name
    return (
      <div>
        <StyledTopBarDiv className="d-inline-flex" data-tid="container">
            <StyledRow>
                <div className="col-sm-4"><b>Tag:</b> {tag}</div>
                <div className="col-sm-2"><b>Date:</b></div>
                <div className="col-sm-3"><b>Number of Plants:</b> {plants}</div>
                <div className="col-sm-3"><b>Captured On:</b></div>
            </StyledRow>
        </StyledTopBarDiv>
        <StyledTopBarHR/>
        <StyledTopBarDiv className="d-inline-flex container" data-tid="container" style={{paddingTop: '0'}}>
            <LeftButton click={buttonHandler}/>
            <RightButton click={buttonHandler}/>
            <div className="custom-control custom-checkbox" style={{margin: 'auto 0 auto 1em'}}>
                <input type="checkbox" className="custom-control-input" id="architecture" defaultChecked={true} onClick={this.props.toggleArch} />
                <label className="custom-control-label" htmlFor="architecture">Architecture</label>
            </div>
            <div className="custom-control custom-checkbox" style={{margin: 'auto 1em auto 1em'}}>
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
