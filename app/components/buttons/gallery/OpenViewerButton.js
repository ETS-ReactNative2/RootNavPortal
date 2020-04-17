// @flow
import React, { Component } from 'react';
import { writeConfig, CLOSE_VIEWER } from '../../../constants/globals';
import { StyledButton } from '../StyledComponents'; 
import TooltipOverlay from '../../common/TooltipOverlay';
import { ipcRenderer } from 'electron';

export default class OpenViewerButton extends Component {

    openViewer = () => {
        ipcRenderer.send('openViewer', null);
    }

    render() { 
        return <TooltipOverlay  component={ props => <StyledButton
                variant="info"
                className={`btn btn-default fas fa-chart-line button`}
                onClick={e => {
                    this.openViewer();
                    e.stopPropagation()
                }}
                {...props}
            />} 
            text={"Open Viewer"}
            placement={"bottom"}
        /> 
    }
}