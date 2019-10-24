// @flow
import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';
const dree = require('dree')
import '../common.css';
import TreeChecklist from '../containers/TreeChecklistContainer';

class AddButton extends Component {

    render() {
    const StyledModal = styled(Modal)` && {
        color: black;
        white-space: pre-wrap;
    }`     

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

        let tree;
        ipcRenderer.on('folderData', (event, data) => {
            if (!data) return;
            tree = data.map((item, i) => dree.scan(item, { depth: 5, extensions: [] } ));
            this.props.updateModalBody(tree);
            // If props already contains a folder that we're supposed to add, filter it out.
            this.props.add(data.filter(word => !this.props.folders.includes(word)));
            this.props.showModal();
        });

        return (
            <>
                <StyledButton
                    variant="success" 
                    onClick={openFileDialog} 
                    className={`btn btn-default fas fa-plus button`} 
                />
                <StyledModal show={this.props.modal} onHide={this.props.closeModal}>
                    <Modal.Header closeButton>
                    <Modal.Title>Select Subfolders</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <TreeChecklist/>
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="danger" onClick={this.props.closeModal}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={this.props.closeModal}>
                        Import
                    </Button>
                    </Modal.Footer>
                </StyledModal> 
            </>
        )
    }
}

export default AddButton;