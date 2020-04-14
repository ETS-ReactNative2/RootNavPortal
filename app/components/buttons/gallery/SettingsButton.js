// @flow
import React, { Component } from 'react';
import { StyledButton, StyledModal } from '../StyledComponents'; 
import { DropdownButton, Dropdown, Button, Modal, Container, Col, Row } from 'react-bootstrap';
import { matchPathName, API_DELETE, writeConfig } from '../../../constants/globals';
import { ipcRenderer } from 'electron';
import { StyledIcon } from '../../CommonStyledComponents';
import TooltipOverlay from '../../common/TooltipOverlay';

export default class SettingsButton extends Component {

    ACTION_NONE         = 0
    ACTION_REANALYSE    = 1;
    ACTION_CHANGE_MODEL = 2;

    DELETE_MESSAGE = "will <b>delete any and all RSML files</b> in this directory and resubmit images to RootNav API. This requires a working server connection.\n\nAre you sure you want to do this?"
    defaultModel = { description: "Please select a model", value: "" };

    constructor(props) {
        super(props);
        const { folders, path, apiModels } = this.props;
        const modelApiName = folders.find(it => it.path == path).model; // Get current modelApiName
        this.state = {
            modal: false,
            confirmText: "",
            titleText: "",
            actionFlag: this.ACTION_NONE,
            // If there's no model selected, create a 'dummy' model to display at the top of the dropdown.
            currentModel: modelApiName ? apiModels.find(it => it.value == modelApiName) : this.defaultModel
        }
    }

    writeUpdatedModel = apiName => {
        const { folders, path, apiAddress, apiKey } = this.props;
        if (!path) return;
        const updatedFolders = folders.map(folder => folder.path === path ? {...folder, model: apiName } : folder);
        writeConfig(JSON.stringify({ apiAddress, apiKey, folders: updatedFolders }, null, 4));
    };

    cancelAction = () => {
        const { folders, apiModels } = this.props;
        //Reset our currentModel to that in Redux if cancel is clicked.
        let reduxModel = folders.find(it => it.path == this.props.path).model;
        this.setState({ currentModel: apiModels.find(apiModel => apiModel.value == reduxModel) || this.defaultModel });
    };

    close = () => {
        this.setState({ modal: false });
        
        setTimeout(() => this.setState({ 
            confirmText: "", 
        }), 250);
    }

    openModal = () => {
        this.setState({ modal: true, confirmText: "", titleText: "" });
    }

    refreshModal = (confirmText, titleText) => {
        this.setState({ modal: false });
        setTimeout(() => this.setState({ modal: true, confirmText, titleText: (titleText || "") }), 250);
    }

    handleAction = () => {
        const { path, updateFolderModel, apiModels }  = this.props; 
        const { actionFlag, currentModel: { value } } = this.state;
        this.setState({ currentModel: apiModels.find(apiModel => apiModel.value == value) || this.defaultModel });
        
        ipcRenderer.send(API_DELETE, { path });
        if (actionFlag == this.ACTION_CHANGE_MODEL) {
            updateFolderModel(path, value); //Finish when model is in state
            this.writeUpdatedModel(value);
        }
    }

    selectDropdown = model => {
        let oldModel = this.props.apiModels.find(model => model.value == this.state.currentModel.value);
        this.setState({  
            actionFlag: this.ACTION_CHANGE_MODEL, 
            currentModel: model 
        });

        let modelText = oldModel ? ` from <b>${oldModel.description}</b>` : "";
        this.refreshModal("Change folder <b>" + matchPathName(this.props.path).fileName + "</b>"+modelText+" to " + "<b>" + model.description + "</b>" + "?\n\nThis " + this.DELETE_MESSAGE, "Change Model");
    }

    renderModalBody = () => {
        const { currentModel } = this.state;
        return this.state.confirmText ? (<div><span dangerouslySetInnerHTML={{__html: this.state.confirmText}}/></div>)
        : (
            <Container>
                <Row>
                    <Col style={{display: "flex"}}>
                        <DropdownButton style={{'display': 'inline-block'}} id="model-button" title={currentModel.description} onClick={e => e.stopPropagation()}>
                            { 
                                this.props.apiModels.map((model, i) => model.description != currentModel.description ? 
                                    <Dropdown.Item key={i} onSelect={() => { this.selectDropdown(model) }}>{model.description}</Dropdown.Item> 
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
                        this.cancelAction();
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