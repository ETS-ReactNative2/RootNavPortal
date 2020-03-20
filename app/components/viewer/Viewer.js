// @flow
import React, { Component } from 'react';
import TopBar from '../containers/viewer/TopBarContainer';
import FolderChecklist from '../containers/viewer/FolderListContainer';
import { StyledContainer, StyledSidebarContainer } from './StyledComponents';
import PluginBar from '../containers/viewer/PluginBarContainer';
import { sep } from 'path';
import { matchPathName, CLOSE_VIEWER } from '../../constants/globals';
import { remote, ipcRenderer } from 'electron';
import Render from '../containers/viewer/RenderContainer';

export default class Viewer extends Component {
    LEFT_KEY  = "ArrowLeft";
    RIGHT_KEY = "ArrowRight";

    constructor(props)
    {
        super(props);
        const { addViewer, removeViewer, path } = props;
        this.state = { path, redFolderBorder: false };
        
        addViewer();
        remote.getCurrentWindow().on('close', () => { //These will cause memory leaks in prod if lots of viewers get opened
            removeViewer(); //However, removing the listener seems to remove it from all viewers (in my limited test), which is bad too.
        });

        ipcRenderer.on(CLOSE_VIEWER, (event, closePath) => {
            if (matchPathName(this.state.path).path == closePath) // If the viewer is currently open on a folder that's been deleted, close the viewer.
                remote.getCurrentWindow().close();
        });
    }

    componentDidMount()
    {
        document.addEventListener("keydown", this.handleClick, false);
    }

    componentWillUnmount()
    {
        document.removeEventListener("keydown", this.handleClick, false);
    }

    toggleFolderBorder = () => {
        this.setState({redFolderBorder: true})
        setTimeout(() => this.setState({redFolderBorder: false}), 4000);
    }

    handleClick = e =>
    {
        if (e.key != this.LEFT_KEY && e.key != this.RIGHT_KEY) return;
        this.loadNextRSML(e.key == this.LEFT_KEY ? -1 : 1);
    };

    loadNextRSML = direction => {
        const { editStack, resetEditStack, files } = this.props;
        if (editStack.length) resetEditStack();
        const { path, fileName } = matchPathName(this.state.path); 
        let folder = path.replace(/\\\\/g, '\\'); //I have a feeling this is going to need OS specific file code here, since Linux can have backslashes(?) - this happens due to URL needing to escape, I think
        let keys = Object.keys(files[folder]);
        let index = keys.indexOf(fileName);
        let file;
        let initialIndex = index;

        do 
        {
            index += direction;
            if (index < 0) index = keys.length - 1; //Wrap left or right around the array if out of bounds
            if (index == keys.length) index = 0;
            file = files[folder][keys[index]] //Cycle through array of files in our current folder to find one with an rsml - check with Mike if we should cycle through all folders
        }
        while (!file.rsml && initialIndex != index) //Only loop through the folder once

        if (initialIndex != index) //If nothing was found, do nothing
        {
            this.setState({path: folder + sep + keys[index]});
        }
    };

    getDate = () => {
        let { path, fileName } = matchPathName(this.state.path);
        path.replace(/\\\\/g, '\\');
        const date = this.props.files[path][fileName].parsedRSML.rsmlJson.rsml[0].metadata[0]["last-modified"][0]["$t"];
        const isValidDate = date.match(/^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i); // Todo ensure this is valid
        return isValidDate ? new Date(date).toDateString() : "Unknown";
    }

    getNumberOfPlants = () => {
        let { path, fileName } = matchPathName(this.state.path);
        path.replace(/\\\\/g, '\\');
        return this.props.files[path][fileName].parsedRSML.rsmlJson.rsml[0].scene[0].plant.length;
    };

    hasSegMasks = () => {
        let { path, fileName } = matchPathName(this.state.path);
        const file = this.props.files[path][fileName];
        return file.hasOwnProperty("_C1") && file.hasOwnProperty("_C2");
    }

    updatePath = newPath => {
        const folder = newPath.replace(/\\\\/g, '\\'); //I have a feeling this is going to need OS specific file code here, since Linux can have backslashes(?) - this happens due to URL needing to escape, I think
        const files = Object.keys(this.props.files[folder]);
        if (files.length == 0) return; // Don't change the folder if there's no files in it!

        this.setState({path: folder + sep + files[0]});
        this.props.resetEditStack();
    }

    render() 
    {
        const { path, redFolderBorder } = this.state;
        return (
            <StyledContainer>
                <TopBar path={path} date={this.getDate()} hasSegMasks={this.hasSegMasks()} buttonHandler={this.loadNextRSML} plants={this.getNumberOfPlants()}/>
                <StyledSidebarContainer>
                    <FolderChecklist path={matchPathName(path).path} updatePath={this.updatePath} redFolderBorder={redFolderBorder}/>
                    <Render path={path}/>
                    <PluginBar toggleFolderBorder={this.toggleFolderBorder}/>
                </StyledSidebarContainer>
            </StyledContainer>
        );
    }
}
