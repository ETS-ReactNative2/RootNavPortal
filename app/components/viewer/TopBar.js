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
import { matchPathName, getFilterRegex } from '../../constants/globals';
import TooltipOverlay from '../common/TooltipOverlay';
import TextPopup from '../common/TextPopup';

export default class TopBar extends Component {

    //Returns how many files have been matched by the filter query for the selected folder
    filteredFileCount = () => {
        const { filterText, filterMode, files, path } = this.props;
        const folderFiles = files[matchPathName(path).path];
        if (!filterText) return Object.keys(folderFiles).length;
 
        return Object.keys(folderFiles).reduce((acc, fileName) => acc += !!fileName.toLowerCase().match(getFilterRegex(filterText, filterMode)) && !folderFiles[fileName].failed, 0); 
    }

    //Gets the set of files to be indexed into to display the count. This ensures that "1 of 3" respects filtering., and isn't "5 of 2"
    getFileSet = folderFiles => {
        const { filterText, filterMode } = this.props;

        return filterText ? Object.keys(folderFiles).reduce((acc, fileName) => (fileName.toLowerCase().match(getFilterRegex(filterText, filterMode)) && !folderFiles[fileName].failed) ? [...acc, fileName] : acc, []) 
            : Object.keys(folderFiles);
    };

    render() {
        const { path, buttonHandler, plants, date, hasSegMasks, file, setFailedState } = this.props;
        const splitPath = matchPathName(path);
        let tag = path ? splitPath.fileName : ""; //Matches the file path into the absolute directory path and file name
        const folderFiles = this.props.files[splitPath.path];
        const noRSMLInFolder = folderFiles && !Object.values(folderFiles).some(file => file?.parsedRSML);
        const isSetFailed = file?.failed;

        let message = ""
        if (noRSMLInFolder) 
            message = <b>"No RSML found in Folder"</b>;
        else if (folderFiles) 
            message = <><b>Open Image: </b>{`${this.getFileSet(folderFiles).indexOf(tag) + 1} of ${this.filteredFileCount()}`}</>;

        let renderTag = file?.failed ? <span style={{color: "red"}}>{tag}</span> : tag;
        let failedIcon = file?.failed ? (
            <TooltipOverlay component={ props => <StyledIcon
                    className={"fas fa-info-circle"}
                    style={{color: "red"}}
                    {...props}
                />} 
                text={"Marked as Failed"}
                placement={"bottom"}
            />) : "";

        return (
            <div>
                <StyledTopBarDiv data-tid="container">
                    <StyledRow>{ folderFiles ? 
                        <>
                            <div className="col-sm-3" style={{overflowX: "hidden", textOverflow: "ellipsis"}}><b>Tag: </b><TextPopup displayText={renderTag} popupText={tag} placement="bottom"/>{failedIcon}</div>
                            <div className="col-sm-3">
                                <span style={{ color: this.filteredFileCount() ? 'black' : 'red'}}>{message}</span>
                                <TooltipOverlay component={ props => <StyledIcon
                                        className={"fas fa-info-circle"}
                                        {...props}
                                    />} 
                                    text={"Any images lacking RSML will be skipped."} // Temporary solution
                                    placement={"bottom"}
                                /> 
                            </div>
                            <div className="col-sm-3"><b>Analysis Date:</b> {date}</div>
                            <div className="col-sm-3"><b>Number of Plants:</b> {plants}</div>
                        </> 
                        : <><b>No Images Loaded:</b>&nbsp;{"Please select a folder on the left hand side to open."}</>}
                    </StyledRow>
                </StyledTopBarDiv>
                <StyledTopBarHR/>
                <StyledTopBarDiv className="d-flex flex-row container justify-content-center" data-tid="container" style={{paddingTop: '0', width: '100%', minWidth: '100%'}}>
                <div className="p-2 mr-auto d-flex">
                    <div className="custom-control custom-checkbox" style={{margin: 'auto 0 auto 1em', width: "auto"}}>
                        <input type="checkbox" className="custom-control-input" disabled={!folderFiles} id="architecture" defaultChecked={true} onClick={this.props.toggleArch} />
                        <label className="custom-control-label" htmlFor="architecture">Architecture</label>
                    </div>
                    <div className="custom-control custom-checkbox" style={{margin: 'auto 1em auto 1em'}}>
                        <input type="checkbox" className="custom-control-input" disabled={!hasSegMasks} id="segMasks" onClick={this.props.toggleSegMasks}/>
                        <label className="custom-control-label" htmlFor="segMasks">Segmentation Masks</label>
                    </div>
                </div>
                <div className="p-2 align-self-center" style={{position: "fixed"}}>
                    <LeftButton click={buttonHandler} disabled={!folderFiles}/>
                    <RightButton click={buttonHandler} disabled={!folderFiles}/>
                </div>
                <div className="p-2" style={{marginRight: "0.5em"}}>
                    <ToggleFailedButton isSetFailed={isSetFailed} toggleFailed={() => setFailedState(splitPath.path, splitPath.fileName)} click={buttonHandler} disabled={!folderFiles}/>
                </div>
                <div className="p-2">
                    <ResetChangesButton />
                    <UndoChangesButton />
                    <SaveRSMLButton path={path} />
                </div>
                </StyledTopBarDiv>
            </div>
        );
    }
}
