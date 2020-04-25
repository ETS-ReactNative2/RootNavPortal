// @flow
import React, { Component } from 'react';
import { StyledTopBarDiv, StyledTopBarHR, StyledIcon } from '../CommonStyledComponents'
import LeftButton from '../buttons/viewer/LeftButton';
import RightButton from '../buttons/viewer/RightButton';
import ToggleFailedButton from '../buttons/viewer/ToggleFailedButton';
import ResetChangesButton from '../containers/viewer/ResetButtonContainer';
import SaveRSMLButton from '../containers/viewer/SaveButtonContainer';
import UndoChangesButton from '../containers/viewer/UndoButtonContainer';
import { StyledRow } from './StyledComponents';
import { matchPathName } from '../../constants/globals';
import TooltipOverlay from '../common/TooltipOverlay';
import { Row } from 'react-bootstrap';

export default class TopBar extends Component {

    render() {
        const { path, buttonHandler, plants, date, hasSegMasks, file, setFailedState } = this.props;
        const splitPath = matchPathName(path);
        let tag = path ? splitPath.fileName : ""; //Matches the file path into the absolute directory path and file name
        const folderFiles = this.props.files[splitPath.path];
        const noRSMLInFolder = folderFiles && !Object.values(folderFiles).some(file => file.parsedRSML);

        const isSetFailed = file.failed;

        let message = ""
        if (noRSMLInFolder) 
            message = <b>"No RSML found in Folder"</b>;
        else if (folderFiles) 
            message = <><b>Open Image: </b>{`${Object.keys(folderFiles).indexOf(tag) + 1} of ${Object.keys(folderFiles).length}`}</>

        let renderTag = tag;
        if (file.failed) 
            renderTag = <>
            <span style={{color: "red"}}>{tag}</span>
                <TooltipOverlay component={ props => <StyledIcon
                        className={"fas fa-info-circle"}
                        style={{color: "red"}}
                        {...props}
                    />} 
                    text={"Marked as Failed"} // Temporary solution
                    placement={"bottom"}
                /> 
            </>

        return (
            <div>
                <StyledTopBarDiv data-tid="container">
                    <StyledRow>{ folderFiles ? <>
                        <div className="col-sm-4"><b>Tag:</b> {renderTag}</div>
                        <div className="col-sm-2">{message}
                            <TooltipOverlay component={ props => <StyledIcon
                                    className={"fas fa-info-circle"}
                                    {...props}
                                />} 
                                text={"Any images with missing RSML vice versa will be skipped."} // Temporary solution
                                placement={"bottom"}
                            /> 
                        </div>
                        <div className="col-sm-3"><b>Analysis Date:</b> {date}</div>
                        <div className="col-sm-3"><b>Number of Plants:</b> {plants}</div>
                    </> : <><b>No Images Loaded:</b>&nbsp;{"Please select a folder on the left hand side to open."}</>}</StyledRow>
                </StyledTopBarDiv>
                <StyledTopBarHR/>
                <StyledTopBarDiv className="d-inline-flex container" data-tid="container" style={{paddingTop: '0', minWidth: '100%'}}>
                    <Row style={{width: "100%"}}>
                        <div className="col-4" style={{display: "-webkit-box"}}>
                            <div className="custom-control custom-checkbox" style={{margin: 'auto 0 auto 1em', width: "auto"}}>
                                <input type="checkbox" className="custom-control-input" disabled={!folderFiles} id="architecture" defaultChecked={true} onClick={this.props.toggleArch} />
                                <label className="custom-control-label" htmlFor="architecture">Architecture</label>
                            </div>
                            <div className="custom-control custom-checkbox" style={{margin: 'auto 1em auto 1em'}}>
                                <input type="checkbox" className="custom-control-input" disabled={!hasSegMasks} id="segMasks" onClick={this.props.toggleSegMasks}/>
                                <label className="custom-control-label" htmlFor="segMasks">Segmentation Masks</label>
                            </div>
                        </div>
                        <div className="col-4" style={{textAlign: "center"}}>
                            <LeftButton click={buttonHandler} disabled={!folderFiles}/>
                            <RightButton click={buttonHandler} disabled={!folderFiles}/>
                        </div>
                        <div className="col-1" style={{textAlign: "right"}}>
                            <ToggleFailedButton isSetFailed={isSetFailed} toggleFailed={() => setFailedState(splitPath.path, splitPath.fileName)} click={buttonHandler} disabled={!folderFiles}/>
                        </div>
                        <div className="col-3" style={{textAlign: "right"}}>
                            <ResetChangesButton />
                            <UndoChangesButton />
                            <SaveRSMLButton path={path} />
                        </div>
                    </Row>
                </StyledTopBarDiv>
            </div>
        );
    }
}
