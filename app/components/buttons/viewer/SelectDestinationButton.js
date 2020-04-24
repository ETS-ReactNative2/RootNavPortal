// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 
import { ipcRenderer } from 'electron';
import TooltipOverlay from '../../common/TooltipOverlay';

export default class SelectDestinationButton extends Component {
    constructor(props)
    {
        super(props);
        ipcRenderer.on(props.ipcMessage, (event, data) => {
            this.setRefValue(data)
        });
    }

    setRefValue = data => {
        this.props.setExportDest(data);
        ipcRenderer.removeListener(this.props.ipcMessage, this.setRefValue);
    };

    render() {    
        return (
            <TooltipOverlay  component={ props => <StyledButton
                    variant="secondary" 
                    onClick={e => { e.stopPropagation(); ipcRenderer.send(this.props.ipcMessage) }} 
                    className={`btn btn-default fa fa-folder-open button`}
                    style={{height: 'auto', margin: '0px', minHeight: 'auto'}}
                    {...props}
                />} 
                text={"Select Export Location"}
            /> 
        )
    }
}