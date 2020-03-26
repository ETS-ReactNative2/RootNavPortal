// @flow
import React, { Component } from 'react';
import { StyledButton, StyledModal } from '../StyledComponents'; 
import { DropdownButton, Dropdown, Button, Modal, Container, Col, Row } from 'react-bootstrap';
import { API_MODELS, matchPathName, API_DELETE, writeConfig } from '../../../constants/globals';
import { ipcRenderer } from 'electron';
import { StyledIcon } from '../../CommonStyledComponents';
import TooltipOverlay from '../../common/TooltipOverlay';

export default class SettingsButton extends Component {

    ACTION_NONE         = 0
    ACTION_REANALYSE    = 1;
    ACTION_CHANGE_MODEL = 2;

    DELETE_MESSAGE = "will <b>delete any and all RSML files</b> in this directory and resubmit images to RootNav API. This requires a working internet connection.\n\nAre you sure you want to do this?"
    defaultModel = { displayName: "Please select a model", apiName: "" };

    constructor(props) {
        super(props);
        const { folders, path } = this.props;
        const modelApiName = folders.find(it => it.path == path).model; // Get current modelApiName
        this.state = {
            modal: false,
            confirmText: "",
            titleText: "",
            actionFlag: this.ACTION_NONE,
            // If there's no model selected, create a 'dummy' model to display at the top of the dropdown.
            currentModel: modelApiName ? API_MODELS.find(it => it.apiName == modelApiName) : this.defaultModel
        }
    }

    writeUpdatedModel = apiName => {
        const { folders, path, apiAddress, apiKey } = this.props;
        if (!path) return;
        const updatedFolders = folders.map(folder => folder.path === path ? {...folder, model: apiName } : folder);
        writeConfig(JSON.stringify({ apiAddress, apiKey, folders: updatedFolders }, null, 4));
    }

    close = () => {
        let reduxModel = this.props.folders.find(it => it.path == this.props.path).model;
        this.setState({ modal: false });
        setTimeout(() => this.setState({ 
            confirmText: "", 
            currentModel: API_MODELS.find(apiModel => apiModel.apiName == reduxModel) || this.defaultModel
        }), 250);
    }

    openModal = () => {
        this.setState({ modal: true, confirmText: "", titleText: "" });
    }

    refreshModal = (confirmText, titleText) => {
        this.setState({ modal: false });
        setTimeout(() => this.setState({ modal: true, confirmText, titleText: (titleText ? titleText : "") }), 250);
    }

    handleAction = () => {
        const { path, updateFolderModel } = this.props; 
        const { actionFlag, currentModel: { apiName } } = this.state;
        
        ipcRenderer.send(API_DELETE, { path });
        if (actionFlag == this.ACTION_CHANGE_MODEL) {
            updateFolderModel(path, apiName); //Finish when model is in state
            this.writeUpdatedModel(apiName);
        }
    }

    selectDropdown = model => {
        let oldModel = API_MODELS.find(model => model.apiName == this.state.currentModel.apiName);
        this.setState({  
            actionFlag: this.ACTION_CHANGE_MODEL, 
            currentModel: model 
        });

        let modelText = oldModel ? ` from <b>${oldModel.displayName}</b>` : "";

        this.refreshModal("Change folder<b>" + matchPathName(this.props.path).fileName + "</b>"+modelText+" to " + "<b>" + model.displayName + "</b>" + "?\n\nThis " + this.DELETE_MESSAGE, "Change Model");
    }

    renderModalBody = () => {
        const { currentModel } = this.state;
        return this.state.confirmText ? (<div><span dangerouslySetInnerHTML={{__html: this.state.confirmText}}/></div>)
        : (
            <Container>
                <Row>
                    <Col style={{display: "flex"}}>
                        <DropdownButton style={{'display': 'inline-block'}} id="model-button" title={currentModel.displayName} onClick={e => e.stopPropagation()}>
                            { 
                                API_MODELS.map((model, i) => model.displayName != currentModel.displayName ? 
                                    <Dropdown.Item key={i} onSelect={() => { this.selectDropdown(model) }}>{model.displayName}</Dropdown.Item> 
                                    : "") 
                            }
                        </DropdownButton>
                        <TooltipOverlay  component={ props => <StyledIcon
                                className={"fas fa-info-circle"}
                                style={{ marginTop: "auto", marginBottom: "auto" }}
                                {...props}
                            />} 
                            text={"This is the plant model used for analysis with RootNav. You can change this, but it will require a reanalysis."}
                            placement={"top"}
                        /> 
                    </Col>
                    <Col> 
                        <Button style={{'float': 'right'}}variant="danger" onClick={e => { 
                            e.stopPropagation(); 
                            this.setState({ actionFlag: this.ACTION_REANALYSE })
                            this.refreshModal("Reanalysing " + this.DELETE_MESSAGE, "Reanalyse"); 
                        }}>Reanalyse</Button>
                    </Col>
                </Row>
            </Container>
        )
    }

    render() {   
        return (
        <>
            <TooltipOverlay component={ props => <StyledButton
                    variant="secondary"
                    className={`btn btn-default fas fa-wrench button`}
                    onClick={e => {
                        e.stopPropagation()
                        this.openModal();
                    }} 
                    {...props}
                />} 
                text={"Settings"}
                />
            <StyledModal show={this.state.modal} onHide={this.close} onClick={e => e.stopPropagation()}>
                <Modal.Header closeButton>
                    <Modal.Title>{this.state.titleText ? this.state.titleText : <>Edit settings for <b>{matchPathName(this.props.path).fileName}</b></>}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.renderModalBody()}
                </Modal.Body>
                <Modal.Footer style={{'justifyContent': this.state.confirmText ? 'space-between' : 'flex-end'}}>
                    {this.state.confirmText && <Button variant="danger" onClick={e => {         
                            e.stopPropagation();
                            this.handleAction();
                            this.close();
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
        </> 
        )
    }
}