// @flow
import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';
import '../common.css';
import { ipcRenderer } from 'electron';

class AddButton extends Component {

    render() {
        const StyledButton = styled(Button)` && {
            width: 2.5em;
            height: 2.5em;
            max-width: 2.5em;
            min-width: 2.5em;
            max-height: 2.5em;
            min-height: 2.5em;
            padding: 6px 0px;
            text-align: center;
            font-size: 20px;
            border-radius: 30px;
            margin: 0px 10px;
        }`
    
        const openFileDialog = () => {
            ipcRenderer.send('openFolder', () => {
                console.log("Sent open folder");
            })
        }
    
        ipcRenderer.on('folderData', (event, data) => {
            if (!data) return;
            // If props already contains a folder that we're supposed to add, filter it out.
            this.props.add(data.filter(word => !this.props.folders.includes(word)));
        });
    
        return (
            <StyledButton
                variant="success" 
                onClick={openFileDialog} 
                className={`btn btn-default fas fa-plus button`} 
            />    
        )
    }
}

export default AddButton;