// @flow
import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { ipcRenderer } from 'electron';
import TreeChecklist from '../../containers/gallery/TreeChecklistContainer';
import { writeConfig, _require, HTTP_PORT } from '../../../constants/globals';
import { StyledButton, StyledModal } from '../StyledComponents'; 
import TooltipOverlay from '../../common/TooltipOverlay';
import { post } from 'axios';
import { StyledModalDialog } from '../../buttons/StyledComponents'; 

export default class AddButton extends Component {
    constructor(props)
    {
        super(props);
        this.state = { pending: false };
        ipcRenderer.on('folderData', (event, data) => {
            this.setState({ pending: true });
            post(`http://127.0.0.1:${HTTP_PORT}/import`, data).then(res => {
                this.setState({ pending: false });
                this.props.updateModalBody(res.data);
                this.props.showModal();
            });
        });
    }

    shouldComponentUpdate(nextProps, nextState)
    {   //Stops this component re-rendering (thus re-rendering the checklist) whenever state changes (by the checklist)
        if (this.state.pending != nextState.pending) return true;
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
        if (this.state.pending) return;
        ipcRenderer.send('openFolder')
    }

    render() {
        return (
            <>
                <TooltipOverlay  component={ props => <StyledButton
                        variant={this.state.pending ? "warning" : "success"} 
                        onClick={this.openFileDialog} 
                        className={`btn btn-default fas fa-plus button`} 
                        {...props}
                    />} 
                    text={this.state.pending ? "Scanning folders for import, please wait" : "Import Folders"}
                    placement={"bottom"}
                /> 
                <StyledModal show={this.props.modal} onHide={this.props.closeModal} dialogAs={StyledModalDialog}>
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