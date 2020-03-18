// @flow
import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { ipcRenderer } from 'electron';
import TreeChecklist from '../../containers/gallery/TreeChecklistContainer';
import { writeConfig } from '../../../constants/globals';
import { StyledButton, StyledModal } from '../StyledComponents'; 
import TooltipOverlay from '../../common/TooltipOverlay';
const dree = require('dree');  

export default class AddButton extends Component {
    constructor(props)
    {
        super(props);
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

    importFolders = () => {
        const { imports, addFolders, closeModal, folders, apiAddress, apiKey } = this.props;
        const config = imports.map(folder => ({'path': folder.path, 'model': folder.model, 'active': false}))
            .filter(newfolder => !folders.some(folder => newfolder.path == folder.path));
        addFolders(config);
        closeModal();
        writeConfig(JSON.stringify({ apiAddress, apiKey, folders: folders.concat(config) }, null, 4));
    }

    openFileDialog = () => {
        ipcRenderer.send('openFolder')
    }

    render() {
        return (
            <>
                <TooltipOverlay  component={ props => <StyledButton
                        variant="success" 
                        onClick={this.openFileDialog} 
                        className={`btn btn-default fas fa-plus button`} 
                        {...props}
                    />} 
                    text={"Import Folders"}
                    placement={"bottom"}
                /> 
                <StyledModal show={this.props.modal} onHide={this.props.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Select plant image folders</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <TreeChecklist/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={this.props.closeModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={() => { this.importFolders(); this.props.clearChecked() }}>
                            Select
                        </Button>
                    </Modal.Footer>
                </StyledModal> 
            </>
        )
    }
}