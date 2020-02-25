// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 
import { ipcRenderer, remote } from 'electron';

export default class SelectDestinationButton extends Component {
    constructor(props)
    {
        super(props);
        ipcRenderer.on('exportDest', (event, data) => {
            console.log(data[0]);
            console.log(this.props.inputRef.current)
            this.props.inputRef.current.value = data[0];
        });
    }

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