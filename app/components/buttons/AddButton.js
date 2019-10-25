// @flow
import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';
import '../common.css';
import TreeChecklist from '../containers/TreeChecklistContainer';
import { existsSync, writeFile, mkdirSync } from 'fs';
import { APPHOME, CONFIG } from '../../constants/globals';
const dree = require('dree');


class AddButton extends Component {
    state = {
        data: []
    };

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
            this.state.data = data;
            // If props already contains a folder that we're supposed to add, filter it out.
            this.props.showModal();
        });

        const importFolders = () => {
            this.props.add(this.state.data.filter(path => !this.props.folders.includes(path)));
            this.props.closeModal();

            if (!existsSync(APPHOME)) //Use our own directory to ensure write access when prod builds as read only.
                mkdirSync(APPHOME, '0777', true, err => {
                     if (err) console.log(err) 
                });

            writeFile(APPHOME + CONFIG , JSON.stringify(this.state.data, null, 4), err => {
                if (err) console.log(err); //idk do some handling here
            });
        }

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
                        <Button variant="primary" onClick={importFolders}>
                            Import
                        </Button>
                    </Modal.Footer>
                </StyledModal> 
            </>
        )
    }
}

export default AddButton;