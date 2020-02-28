// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 
import { ipcRenderer, remote } from 'electron';

export default class SelectDestinationButton extends Component {
    constructor(props)
    {
        super(props);
        ipcRenderer.on('exportDest', (event, data) => {
            this.setRefValue(data)
        });
    }

    setRefValue = data => {
        this.props.inputRef.current.value = data;
        ipcRenderer.removeListener('exportDest', this.setRefValue);
    };

    render() {    
        return (
            <StyledButton
                variant="secondary" 
                onClick={() => ipcRenderer.send('getExportDest')} 
                className={`btn btn-default fa fa-folder-open button`} 
            />    
        )
    }
}