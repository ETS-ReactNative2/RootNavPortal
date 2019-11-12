// @flow
import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { ipcRenderer } from 'electron';
import '../../common.css';
import TreeChecklist from '../../containers/TreeChecklistContainer';
import { existsSync, writeFile, mkdirSync } from 'fs';
import { APPHOME, CONFIG } from '../../../constants/globals';
import { StyledButton, StyledModal } from '../StyledComponents'; 
const dree = require('dree');  

class AddButton extends Component {

    shouldComponentUpdate(nextProps, nextState)
    {   //Stops this component re-rendering (thus re-rendering the checklist) whenever state changes (by the checklist)
        return nextProps.modal !== this.props.modal //Only re-render when modal state changes. 
        //Other state is for data passing and internals
    }

    render() {
        
        const openFileDialog = () => {
            ipcRenderer.send('openFolder')
        }

        ipcRenderer.on('folderData', (event, data) => {
            let tree = data.map((item, i) => dree.scan(item, { depth: 5, extensions: [] } )); //Filter out files, with a depth of 5. Make an exclude regex of standard big paths, like OS folders, node_modules, other big dependency thinhs
            this.props.updateModalBody(tree);
            this.props.showModal();
        });

        const importFolders = () => {
            const folders = this.props.imports.map(path => ({'path': path, 'active': false}));
            this.props.addFolders(folders.filter(newfolder => !this.props.folders.some(folder => newfolder.path == folder.path)));
            this.props.closeModal();

            if (!existsSync(APPHOME)) //Use our own directory to ensure write access when prod builds as read only.
                mkdirSync(APPHOME, '0777', true, err => {
                     if (err) console.log(err) 
                });
            writeFile(APPHOME + CONFIG , JSON.stringify(folders, null, 4), err => {
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
                        <TreeChecklist />
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