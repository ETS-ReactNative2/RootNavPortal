// @flow
import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { ipcRenderer } from 'electron';
import '../../common.css';
import TreeChecklist from '../../containers/gallery/TreeChecklistContainer';
import { existsSync, writeFile, mkdirSync } from 'fs';
import { APPHOME, CONFIG } from '../../../constants/globals';
import { StyledButton, StyledModal } from '../StyledComponents'; 
const dree = require('dree');  

class AddButton extends Component {
    constructor(props)
    {
        super(props);
        this.tree = React.createRef();
        ipcRenderer.on('folderData', (event, data) => {
            let tree = data.map((item, i) => dree.scan(item, { depth: 5, extensions: [] } )); //extensions: [] excludes all files, because the modal is a folder picker. Don't change this. Need to make an exclude regex for things like system folders and node_modules in case
            this.props.updateModalBody(tree);
            this.props.showModal();
        });
    }

    shouldComponentUpdate(nextProps, nextState)
    {   //Stops this component re-rendering (thus re-rendering the checklist) whenever state changes (by the checklist)
        return nextProps.modal !== this.props.modal //Only re-render when modal state changes. 
        //Other state is for data passing and internals
    }

    openFileDialog() {
        ipcRenderer.send('openFolder')
    }

    importFolders() {
        const folders = this.props.imports.map(path => ({'path': path, 'active': true}));
        this.props.addFolders(folders.filter(newfolder => !this.props.folders.some(folder => newfolder.path == folder.path)));
        this.props.closeModal();
        this.tree.current.clear();

        if (!existsSync(APPHOME)) //Use our own directory to ensure write access when prod builds as read only.
            mkdirSync(APPHOME, '0777', true, err => {
                 if (err) console.log(err) 
            });
        writeFile(APPHOME + CONFIG , JSON.stringify(folders, null, 4), err => {
            if (err) console.log(err); //idk do some handling here
        });
    }

    close() {
        this.tree.current.clear();
        this.props.closeModal();
    }

    render() {
        return (
            <React.Fragment>
                <StyledButton
                    variant="success" 
                    onClick={this.openFileDialog} 
                    className={`btn btn-default fas fa-plus button`} 
                />
                <StyledModal show={this.props.modal} onHide={close}>
                    <Modal.Header closeButton>
                        <Modal.Title>Select Subfolders</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <TreeChecklist ref={this.tree}/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={this.close}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={this.importFolders}>
                            Import
                        </Button>
                    </Modal.Footer>
                </StyledModal> 
            </React.Fragment>
        )
    }
}

export default AddButton;