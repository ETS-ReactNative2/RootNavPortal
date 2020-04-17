// @flow
import React, { Component } from 'react';
import TopBar from '../containers/viewer/TopBarContainer';
import FolderChecklist from '../containers/viewer/FolderListContainer';
import { StyledContainer, StyledSidebarContainer } from './StyledComponents';
import PluginBar from '../containers/viewer/PluginBarContainer';
import { sep } from 'path';
import { matchPathName, CLOSE_VIEWER, IMAGE_EXTS_REGEX, IMAGES_REMOVED_FROM_GALLERY } from '../../constants/globals';
import { remote, ipcRenderer } from 'electron';
import Render from '../containers/viewer/RenderContainer';

export default class Viewer extends Component {
    LEFT_KEY  = "ArrowLeft";
    RIGHT_KEY = "ArrowRight";

    constructor(props)
    {
        super(props);
        const { addViewer, removeViewer, path } = props;
        this.state = { path: (!path ? null : path ), redFolderBorder: false };
        
        addViewer();
        remote.getCurrentWindow().on('close', () => { //These will cause memory leaks in prod if lots of viewers get opened
            removeViewer(); //However, removing the listener seems to remove it from all viewers (in my limited test), which is bad too.
        });

        ipcRenderer.on(CLOSE_VIEWER, (event, closePath) => {
            if (matchPathName(this.state.path).path == closePath) // If the viewer is currently open on a folder that's been deleted, close the viewer.
                remote.getCurrentWindow().close();
        });
        ipcRenderer.on(IMAGES_REMOVED_FROM_GALLERY, (event, info) => {
            if (info.some(removedFile => this.state.path === `${removedFile.folder}${sep}${removedFile.filename}`)) {
                this.loadNextRSML(1);
            }
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

    // Optional parameter to take the current path in order to avoid a second state change immediately after the first in some cases. 
    loadNextRSML = (direction, optionalCurrentPath) => {
        const { editStack, resetEditStack, files } = this.props;
        if (editStack.length) resetEditStack();
        const { path, fileName } = matchPathName(optionalCurrentPath || this.state.path); 
        let keys = Object.keys(files[path]);
        let index = keys.indexOf(fileName);
        let file;
        let initialIndex = index;
        let containsImage;
        do 
        {
            index += direction;
            if (index < 0) index = keys.length - 1; //Wrap left or right around the array if out of bounds
            if (index == keys.length) index = 0;
            file = files[path][keys[index]] //Cycle through array of files in our current folder to find one with an rsml - check with Mike if we should cycle through all folders
            containsImage = Object.keys(file).find(ext => ext.match(IMAGE_EXTS_REGEX));
        }
        while ((!file.rsml || !containsImage) && initialIndex != index) //Only loop through the folder once
        if (initialIndex != index) //If nothing was found, do nothing TODO put in special case here, and let viewer have 'nothing' loaded.
        {
            this.setState({path: path + sep + keys[index]});
        }
    };

    getDate = rsml => {
        if (!rsml) return "Unknown";
        const date = rsml.rsmlJson.rsml[0].metadata[0]["last-modified"][0]["$t"];
        const isValidDate = date.match(/^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i); // Todo ensure this is valid
        return isValidDate ? new Date(date).toDateString() : "Unknown";
    }

    getNumberOfPlants = rsml => {
        if (!rsml) return "Unknown";
        let { path, fileName } = matchPathName(this.state.path);
        return this.props.files[path][fileName].parsedRSML.rsmlJson.rsml[0].scene[0].plant.length;
    };

    hasSegMasks = () => {
        if (!this.state.path) return false;
        let { path, fileName } = matchPathName(this.state.path);
        const file = this.props.files[path][fileName];
        return file.hasOwnProperty("_C1") && file.hasOwnProperty("_C2");
    }

    updatePath = newPath => {
        const { editStack, resetEditStack } = this.props;
        const files = Object.keys(this.props.files[newPath]);
        if (files.length == 0) return; // Don't change the folder if there's no files in it!
        const firstFile = files[0];
        const newFilePath = newPath + sep + firstFile;

        const exts = Object.keys(this.props.files[newPath][firstFile]);
        if (exts.find(ext => ext.match(IMAGE_EXTS_REGEX)) && exts.includes("rsml")) // If the first file has an image, then load!
            this.setState(state => {return {...state, path: newFilePath}});
        else 
            this.loadNextRSML(1, newFilePath);

        if (editStack.length) resetEditStack();
    }

    render() 
    {
        const { path, redFolderBorder } = this.state;
        const matchedPath = path ? matchPathName(path) : null;
        const rsml = matchedPath ? this.props.files[matchedPath.path][matchedPath.fileName].parsedRSML : null;
        return (
            <StyledContainer>
                <TopBar path={path} date={this.getDate(rsml)} hasSegMasks={this.hasSegMasks()} buttonHandler={this.loadNextRSML} plants={this.getNumberOfPlants(rsml)}/>
                <StyledSidebarContainer>
                    <FolderChecklist path={matchedPath ? matchedPath.path : null} updatePath={this.updatePath} redFolderBorder={redFolderBorder}/>
                    <Render path={path}/>
                    <PluginBar toggleFolderBorder={this.toggleFolderBorder}/>
                </StyledSidebarContainer>
            </StyledContainer>
        );
    }
}
