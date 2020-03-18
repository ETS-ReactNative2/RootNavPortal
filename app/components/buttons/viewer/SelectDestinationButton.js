// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 
import { ipcRenderer } from 'electron';
import TooltipOverlay from '../../common/TooltipOverlay';

export default class SelectDestinationButton extends Component {
    constructor(props)
    {
        super(props);
        ipcRenderer.on('exportDest', (event, data) => {
            this.setRefValue(data)
        });
    }

    setRefValue = data => {
        this.props.setExportDest(data);
        ipcRenderer.removeListener('exportDest', this.setRefValue);
    };

    render() {    
        return (
            <TooltipOverlay  component={ props => <StyledButton
                    variant="secondary" 
                    onClick={() => ipcRenderer.send('getExportDest')} 
                    className={`btn btn-default fa fa-folder-open button`}
                    style={{height: 'auto', margin: '0px', minHeight: 'auto'}}
                    {...props}
                />} 
                text={"Select Export Location"}
            /> 
        )
    }
}