// @flow
import React, { Component } from 'react';
import { StyledButton, StyledModal } from '../StyledComponents'; 
import { DropdownButton, Dropdown, Button, Modal, Container, Col, Row } from 'react-bootstrap';
import { API_MODELS, matchPathName, API_DELETE, APPHOME, CONFIG } from '../../../constants/globals';
import { existsSync, writeFile } from 'fs';
import { ipcRenderer } from 'electron';

class SettingsButton extends Component {

    ACTION_NONE         = 0
    ACTION_REANALYSE    = 1;
    ACTION_CHANGE_MODEL = 2;

    DELETE_MESSAGE = "will <b>delete all RSML files</b> in this directory and resubmit images to RootNav API. This requires a working internet connection.\n\nAre you sure you want to do this?"

    constructor(props) {
        super(props);
        const { folders, path } = this.props;
        const modelApiName = folders.find(it => it.path == path).model; // Get current modelApiName
        this.state = {
            modal: false,
            confirmText: "",
            actionFlag: this.ACTION_NONE,
            // If there's no model selected, create a 'dummy' model to display at the top of the dropdown.
            currentModel: modelApiName ? API_MODELS.find(it => it.apiName == modelApiName) : {displayName: "Please select a Model!"} 
        }
    }

    writeUpdatedModel = apiName => {
        const { folders, path } = this.props;
        if (!path) return;
        const updatedFolders = folders.map(folder => folder.path === path ? {...folder, model: apiName } : folder);
        if (existsSync(APPHOME))    //Rewrite config file with removed directories so they don't persist
            writeFile(APPHOME + CONFIG , JSON.stringify(updatedFolders, null, 4), err => {
                if (err) {
                    console.err("Could not write updated model!");
                    console.err("Folder: " + path + " Model: " + apiName);
                    console.err(err);
                }
            });
    }

    close = () => {
        this.setState({ modal: false, confirmText: "" });
    }

    openModal = () => {
        this.setState({ modal: true, confirmText: "" });
    }

    refreshModal = confirmText => {
        this.setState({modal: false});
        setTimeout(() => this.setState({modal: true, confirmText}), 250)
    }

    handleAction = () => {
        const { path, updateFolderModel } = this.props; 
        const { apiName } = this.state.currentModel;
        ipcRenderer.send(API_DELETE, { path });
        if (this.actionFlag == this.CHANGE_MODEL) {
            updateFolderModel(path, apiName); //Finish when model is in state
            this.writeUpdatedModel(apiName);
        }
    }

    selectDropdown = model => {
        this.setState({ actionFlag: this.ACTION_CHANGE_MODEL, currentModel: model }); 
        this.refreshModal("Change <b>" + matchPathName(this.props.path)[2] + "</b> from <b>GetThisFromState</b> to " + "<b>" + model.displayName + "</b>" + "?\n\nThis " + this.DELETE_MESSAGE)
    }

    renderModalBody = () => {
        const { currentModel } = this.state;
        return this.state.confirmText ? (<div><span dangerouslySetInnerHTML={{__html: this.state.confirmText}}/></div>)
        : (
            <Container>
                <Row>
                    <Col>
                        <DropdownButton style={{'display': 'inline-block'}} id="model-button" title={currentModel.displayName} onClick={e => e.stopPropagation()}>
                            { 
                                API_MODELS.map((model, i) => model.displayName != currentModel.displayName ? 
                                    <Dropdown.Item key={i} onSelect={() => { this.selectDropdown(model) }}>{model.displayName}</Dropdown.Item> 
                                    : "") 
                            }
                        </DropdownButton>
                    </Col>
                    <Col> 
                        <Button style={{'float': 'right'}}variant="danger" onClick={e => { 
                            e.stopPropagation(); 
                            this.setState({ actionFlag: this.ACTION_REANALYSE })
                            this.refreshModal("Reanalysing " + this.DELETE_MESSAGE) 
                        }}>Reanalyse</Button>
                    </Col>
                </Row>
            </Container>
        )
    }

    render() {    
    
        return (
        <React.Fragment>
            <StyledButton
                variant="secondary" 
                onClick={e => {
                    e.stopPropagation()
                    this.openModal();
                }} 
                className={`btn btn-default fas fa-wrench button`} 
            />
            <StyledModal show={this.state.modal} onHide={this.close} onClick={e => e.stopPropagation()}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit settings for <b>{matchPathName(this.props.path)[2]}</b></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.renderModalBody()}
                </Modal.Body>
                <Modal.Footer style={{'justifyContent': this.state.confirmText ? 'space-between' : 'flex-end'}}>
                    {this.state.confirmText && <Button variant="danger" onClick={e => {         
                            e.stopPropagation();
                            this.close();
                            this.handleAction();
                        }}>
                            Confirm
                    </Button>}

                    <Button variant="secondary" onClick={e => {         
                        e.stopPropagation();
                        this.close();
                    }}>
                        Cancel
                    </Button>

                </Modal.Footer>
            </StyledModal>
        </React.Fragment> 
        )
    }
}

export default SettingsButton;