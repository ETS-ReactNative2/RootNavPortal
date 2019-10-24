// @flow
import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import styled from 'styled-components';
import '../common.css';
import { ipcRenderer } from 'electron';
import dirTree from 'directory-tree';

class AddButton extends Component {

    render() {
        let showModal = false;
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
        
        const handleClose = () => showModal = false;
        const handleShow  = () => { console.log("toggling"); showModal = true };

        const openFileDialog = () => {
            ipcRenderer.send('openFolder', () => {
                console.log("Sent open folder");
            })
        }
    
        ipcRenderer.on('folderData', (event, data) => {
            if (!data) return;
            const tree = data.map((item, i) => dirTree(item, { exclude: [/\*local\*/] }));
            console.log(tree);
            handleShow();
            // If props already contains a folder that we're supposed to add, filter it out.
            this.props.add(data.filter(word => !this.props.folders.includes(word)));
        });

        return (
            <>
                <StyledButton
                    variant="success" 
                    onClick={openFileDialog} 
                    className={`btn btn-default fas fa-plus button`} 
                />
                <Modal show={showModal} onHide={handleClose}>
                    <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleClose}>
                        Save Changes
                    </Button>
                    </Modal.Footer>
                </Modal> 
            </>
        )
    }
}

export default AddButton;