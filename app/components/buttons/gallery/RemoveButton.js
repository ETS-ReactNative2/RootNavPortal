// @flow
import React, { Component } from 'react';
import { writeConfig, CLOSE_VIEWER } from '../../../constants/globals';
import { StyledButton } from '../StyledComponents'; 
import TooltipOverlay from '../../common/TooltipOverlay';
import { ipcRenderer } from 'electron';

export default class RemoveButton extends Component {

    deleteFolder = () => {
        const { folders, path, apiAddress, apiKey } = this.props;
        ipcRenderer.send(CLOSE_VIEWER, path);
        if (!path) return;
        const filteredPaths = folders.filter(folder => folder.path !== path);
        writeConfig(JSON.stringify({ apiAddress, apiKey, folders: filteredPaths }, null, 4));
        this.props.remove(path);
    }

    render() { 
        return <TooltipOverlay  component={ props => <StyledButton
                variant="danger"
                className={`btn btn-default fas fa-trash-alt button`}
                onClick={e => {
                    this.deleteFolder();
                    e.stopPropagation()
                }}      
                {...props}
            />} 
            text={"Remove Folder"}
        /> 
    }
}