// @flow
import React, { Component } from 'react';
import { StyledButton, StyledModal } from '../StyledComponents'; 
import { DropdownButton, Dropdown, Button, Modal, Container, Col, Row, InputGroup, Collapse } from 'react-bootstrap';
import { matchPathName, API_DELETE, writeConfig, IMAGE_EXTS_REGEX } from '../../../constants/globals';
import { ipcRenderer, shell } from 'electron';
import { StyledIcon } from '../../CommonStyledComponents';
import TooltipOverlay from '../../common/TooltipOverlay';
import SelectDestinationButton from '../../buttons/viewer/SelectDestinationButton';
import styled from 'styled-components';
import { copyFile, unlink } from 'fs';
import { sep } from 'path';
import { StyledModalDialog } from '../../buttons/StyledComponents'; 
export default class SettingsButton extends Component {
    StyledI = styled.i`
        color: #d9534f;
        margin-right: 0.25em;
        font-size: 1.2em;
    `;
    ACTION_NONE         = 0
    ACTION_REANALYSE    = 1;
    ACTION_CHANGE_MODEL = 2;

    DELETE_MESSAGE = "will <b>delete any and all RSML files</b> in this directory and resubmit images to RootNav API. This requires a working server connection.\n\nAre you sure you want to do this?"
    defaultModel = { description: "Please select a model", value: "" };

    constructor(props) {
        super(props);
        const { folders, path, apiModels } = this.props;
        const modelApiName = folders.find(it => it.path == path).model; // Get current modelApiName
        this.exportDest = React.createRef();
        
        this.state = {
            modal: false,
            exportModal: false,
            confirmText: "",
            titleText: "",
            actionFlag: this.ACTION_NONE,
            exportable: true,
            copying: false,
            copyingComplete: false,
            error: false,
            // If there's no model selected, create a 'dummy' model to display at the top of the dropdown.
            currentModel: modelApiName ? apiModels.find(it => it.value == modelApiName) : this.defaultModel
        }
    }

    openContainingDirectory = () => {
        shell.openItem(this.exportDest.current.value);
    };

    closeExportModal = () => {
        this.setState({ exportModal: false });
        setTimeout(() => this.setState({ 
            copyingComplete: false, 
            copying: false, 
            actionFlag: this.ACTION_NONE, 
            exportDest: ""
        }), 250);
    };

    export = () => {
        if (!this.exportDest.current.value) return this.setState({ exportable: false });
        this.setState({ copying: true, copyingComplete: false });
        const { files, path, removeFiles } = this.props;
        let removedFiles = [];

        Object.keys(files).forEach(fileName => {
            if (files[fileName].failed)
            {
                let imageExt = Object.keys(files[fileName]).find(ext => ext.match(IMAGE_EXTS_REGEX));
                copyFile(`${path}${sep}${fileName}.${imageExt}`, `${this.exportDest.current.value}${sep}${fileName}.${imageExt}`, error => {
                    if (error) 
                    {
                        this.setState({ error: true });
                    }
                    else unlink(`${path}${sep}${fileName}.${imageExt}`, () => {});
                });
                if (!this.state.error) removedFiles.push(fileName);
            }
        })
        if (removedFiles.length) removeFiles(path, removedFiles);
        setTimeout(() => this.setState({ copyingComplete: true }), 225);
    };

    setExportDest = value => {
        this.exportDest.current.value = value;
        this.setState({ exportable: true });
    };

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
    };

    openModal = () => {
        this.setState({ modal: true, confirmText: "", titleText: "" });
    };

    refreshModal = (confirmText, titleText) => {
        this.setState({ modal: false });
        setTimeout(() => this.setState({ modal: true, confirmText, titleText: (titleText || "") }), 250);
    };

    handleAction = () => {
        const { path, updateFolderModel, apiModels }  = this.props; 
        const { actionFlag, currentModel: { value } } = this.state;
        this.setState({ currentModel: apiModels.find(apiModel => apiModel.value == value) || this.defaultModel });
        
        ipcRenderer.send(API_DELETE, { path });
        if (actionFlag == this.ACTION_CHANGE_MODEL) {
            updateFolderModel(path, value); //Finish when model is in state
            this.writeUpdatedModel(value);
        }
    };

    selectDropdown = model => {
        let oldModel = this.props.apiModels.find(model => model.value == this.state.currentModel.value);
        this.setState({  
            actionFlag: this.ACTION_CHANGE_MODEL, 
            currentModel: model 
        });

        let modelText = oldModel ? ` from <b>${oldModel.description}</b>` : "";
        this.refreshModal("Change folder <b>" + matchPathName(this.props.path).fileName + "</b>"+modelText+" to " + "<b>" + model.description + "</b>" + "?\n\nThis " + this.DELETE_MESSAGE, "Change Model");
    };

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
                        <Button style={{'float': 'right', width: 'max-content'}}variant="info" onClick={e => { 
                            e.stopPropagation(); 
                            this.setState({ exportModal: true, modal: false })
                        }}>Export Failed</Button>
                    
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
            <StyledModal show={this.state.modal} onHide={this.close} onClick={e => e.stopPropagation()} dialogAs={this.state.confirmText ? Modal.Dialog : StyledModalDialog}>
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
                    {!this.state.confirmText && !this.props.apiStatus ? <span>No server connection found. No images can be analysed <this.StyledI className="fas fa-exclamation-circle"/> </span> : ""}
                    <Button variant="secondary" onClick={e => {         
                        e.stopPropagation();
                        this.cancelAction();
                        this.close();
                    }}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </StyledModal>

           <StyledModal show={this.state.exportModal} onHide={this.closeExportModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Export Failed Images</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <InputGroup style={!this.state.exportable ? { boxShadow: '0 0 10px red', borderRadius: '7px 20px 20px 7px' } : {}}>
                        <InputGroup.Prepend>
                            <InputGroup.Text>
                                <StyledIcon className={"fas fa-save fa-lg"}/>
                            </InputGroup.Text> 
                        </InputGroup.Prepend>
                        <input key={0} type="text" className="form-control" readOnly ref={this.exportDest}/>
                        <InputGroup.Append>
                            <SelectDestinationButton setExportDest={this.setExportDest} ipcMessage={'getExportFailedDest'}/>
                        </InputGroup.Append>
                    </InputGroup>
                    <Collapse in={this.state.copying}>
                        <div>
                            <div style={{ display: 'flex' }} className={"circle-loader" + (this.state.copyingComplete ? " load-complete" : "")}>
                                <div style={this.state.copyingComplete ? {display: 'block'} : {display: 'none'}} className={(this.state.copyingComplete ? "checkmark " : "") + "draw"}></div>
                            </div>
                        </div>
                        {/* {this.state.error && <span>Moving file failed, do you have write permissions?</span>} */}
                    </Collapse>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        className="float-left" variant="secondary" onClick={this.openContainingDirectory} 
                        style={{opacity: this.state.copyingComplete ? 1 : 0, transition: '0.2s ease-in-out', marginRight: 'auto'}}
                    >
                        Open <StyledIcon className={"fas fa-external-link-alt"}/>
                    </Button>
                    <Button variant={this.state.copyingComplete ? "success" : "danger"} onClick={this.closeExportModal} style={{transition: '0.2s ease-in-out'}}>
                        {this.state.copyingComplete ? "Close" : "Cancel"}
                    </Button>
                    <Button variant="primary" onClick={e => { e.stopPropagation(); this.export() }}>
                        Export
                    </Button>
                </Modal.Footer>
            </StyledModal>
        </>
        )
    }
}