// @flow
import React, { Component } from 'react';
import { StyledButton, StyledModal } from '../StyledComponents'; 
import { DropdownButton, Dropdown, Button, Modal, Container, Col, Row, InputGroup, Collapse } from 'react-bootstrap';
import { matchPathName, API_DELETE, API_PARSE, writeConfig, IMAGE_EXTS_REGEX, sendThumbs, ALL_EXTS_REGEX } from '../../../constants/globals';
import { ipcRenderer, shell } from 'electron';
import { StyledIcon } from '../../CommonStyledComponents';
import TooltipOverlay from '../../common/TooltipOverlay';
import SelectDestinationButton from '../../buttons/viewer/SelectDestinationButton';
import styled from 'styled-components';
import { copyFile, unlink, copyFileSync, readdir, exists } from 'fs';
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
    ACTION_EXPORT       = 3;

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
        shell.openItem(this.state.actionFlag == this.ACTION_EXPORT ? this.exportDest.current.value : this.props.path);
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
                        console.error(error);
                        this.setState({ error: true });
                    }
                    else 
                    {
                        unlink(`${path}${sep}${fileName}.${imageExt}`, error => error ? console.log(error) : {});
                        if (files[fileName].rsml) exists(`${path}${sep}${fileName}.rsml`, bool => bool && unlink(`${path}${sep}${fileName}.rsml`, () => {})); //also remove RSML of failed if it exists
                    }
                });
                if (!this.state.error) removedFiles.push(fileName);
            }
        });
        if (removedFiles.length) removeFiles(path, removedFiles);
        setTimeout(() => this.setState({ copyingComplete: true }), 225);
    };

    import = () => {
        if (!this.exportDest.current.value) return this.setState({ exportable: false });
        this.setState({ copying: true, copyingComplete: false });
        const { files, path, addFiles, addThumbs } = this.props;

        readdir(this.exportDest.current.value, (err, folderFiles) => {
            let structuredFiles = {};

            let matched = folderFiles.map(file => file.match(ALL_EXTS_REGEX))
                .filter(match => match) // Filter out null values, failed regex match.
                .map(match => match.groups); //Scan for file types we use
            
                matched.forEach(regex => { //Structure of this array will be [original string, file name, file extension, some other stuff]
                if (Object.keys(regex).length) 
                {
                    let name = regex.fileName; //Each file has an object with the key as the file name
                    let ext  = regex.segMask ? regex.segMask.toUpperCase() : regex.ext.toLowerCase(); //if it's a seg mask like file_C1.png we'll get _C1, else we use the actual ext
                    if (!structuredFiles[name]) structuredFiles[name] = {}; // if there is rsml and the png you'll get filename: {rsml: true, png: true}
                    structuredFiles[name][ext] = true; //This assumes filename stays consistent for variants of the file. They have to, else there'll be no link I guess. 2x check API behaviour on this.
                }
            });

            let fileKeys = Object.keys(structuredFiles);
            if (fileKeys.length) 
            {
                
                let filesToParse = [];
                let imagesToThumb = [];
                fileKeys.forEach(fileName => {

                    if (!structuredFiles[fileName].rsml) return delete structuredFiles[fileName]; //If no RSML found, delete the key
                    Object.keys(structuredFiles[fileName]).forEach(extKey => {
                        if (extKey != 'rsml' && !extKey.match(IMAGE_EXTS_REGEX)) return; //Only operate on images and RSML files for now

                        //Copy file, the delete the original, for each RSML/image ext.
                        copyFileSync(`${this.exportDest.current.value}${sep}${fileName}.${extKey}`, `${path}${sep}${fileName}.${extKey}`);
                        unlink(`${this.exportDest.current.value}${sep}${fileName}.${extKey}`, error => {
                            if (error) console.error(error);
                        });
                    });

                    filesToParse.push(path + sep + fileName);
                    const { parsedRSML, _C1, _C2, rsml, ...exts } = structuredFiles[fileName];
                    if (Object.keys(exts).length) imagesToThumb.push({ folder: path, file: exts, fileName });
                });
                addFiles(path, { ...files, ...structuredFiles }); //Add our struct with the folder as the key to state
                if (filesToParse.length) 
                {
                    ipcRenderer.send(API_PARSE, filesToParse);
                }
                if (imagesToThumb.length)
                {
                    sendThumbs(imagesToThumb.filter(item => item !== undefined), addThumbs).then(() => {});
                }
            }
        });
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
        const { currentModel, confirmText } = this.state;
        return confirmText ? (<div><span dangerouslySetInnerHTML={{__html: confirmText}}/></div>)
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
                    <Col style={{display: "flex"}}>
                        <Button style={{'float': 'right', width: 'max-content'}}variant="info" onClick={e => { 
                            e.stopPropagation(); 
                            this.setState({ exportModal: true, modal: false, actionFlag: this.ACTION_EXPORT });
                        }}>Export Failed</Button>

                        <TooltipOverlay  component={ props => <StyledIcon
                                className={"fas fa-info-circle"}
                                style={{ marginTop: "auto", marginBottom: "auto" }}
                                {...props}
                            />} 
                            text={"Exports images marked as failed to another folder for manual analysis."}
                            placement={"top"}
                        /> 
                    </Col>
                    <Col style={{display: "flex"}}>
                        <Button style={{'float': 'right', width: 'max-content'}}variant="info" onClick={e => { 
                            e.stopPropagation(); 
                            this.setState({ exportModal: true, modal: false });
                        }}>Reimport Files</Button>
                        
                        <TooltipOverlay  component={ props => <StyledIcon
                                className={"fas fa-info-circle"}
                                style={{ marginTop: "auto", marginBottom: "auto" }}
                                {...props}
                            />} 
                            text={"Imports a folder of images WITH RSML to this folder. Ideal for importing corrected images."}
                            placement={"top"}
                        /> 
                    </Col>
                    <Col> 
                        <Button style={{'float': 'right'}} variant="danger" onClick={e => { 
                            e.stopPropagation(); 
                            this.setState({ actionFlag: this.ACTION_REANALYSE })
                            this.refreshModal("Reanalysing " + this.DELETE_MESSAGE, "Reanalyse"); 
                        }}>Reanalyse</Button>
                    </Col>
                </Row>
            </Container>
        )
    };

    render() {   
        const { modal, confirmText, exportModal, exportable, copying, copyingComplete, actionFlag, titleText } = this.state;
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
            <StyledModal show={modal} onHide={this.close} onClick={e => e.stopPropagation()} dialogAs={confirmText ? Modal.Dialog : StyledModalDialog}>
                <Modal.Header closeButton>
                    <Modal.Title>{titleText || <>Edit settings for <b>{matchPathName(this.props.path).fileName}</b></>}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.renderModalBody()}
                </Modal.Body>
                <Modal.Footer style={{'justifyContent': confirmText ? 'space-between' : 'flex-end'}}>
                    {confirmText && <Button variant="danger" onClick={e => {         
                            e.stopPropagation();
                            this.handleAction();
                            this.close();
                        }}>
                            Confirm
                    </Button>}
                    {!confirmText && !this.props.apiStatus ? <span>No server connection found. No images can be analysed <this.StyledI className="fas fa-exclamation-circle"/> </span> : ""}
                    <Button variant="secondary" onClick={e => {         
                        e.stopPropagation();
                        this.cancelAction();
                        this.close();
                    }}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </StyledModal>

           <StyledModal show={exportModal} onHide={this.closeExportModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{actionFlag == this.ACTION_EXPORT ? "Export" : "Import"} Failed Images</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <InputGroup style={!exportable ? { boxShadow: '0 0 10px red', borderRadius: '7px 20px 20px 7px' } : {}}>
                        <InputGroup.Prepend>
                            <InputGroup.Text>
                                <StyledIcon className={"fas fa-save fa-lg"}/>
                            </InputGroup.Text> 
                        </InputGroup.Prepend>
                        <input key={0} type="text" className="form-control" readOnly ref={this.exportDest}/>
                        <InputGroup.Append>
                            <SelectDestinationButton setExportDest={this.setExportDest} ipcMessage={'getExportFailedDest'} tooltip={`Select ${actionFlag == this.ACTION_EXPORT ? "export" : "import"} location`}/>
                        </InputGroup.Append>
                    </InputGroup>
                    <Collapse in={copying}>
                        <div>
                            <div style={{ display: 'flex' }} className={"circle-loader" + (copyingComplete ? " load-complete" : "")}>
                                <div style={copyingComplete ? {display: 'block'} : {display: 'none'}} className={(copyingComplete ? "checkmark " : "") + "draw"}></div>
                            </div>
                        </div>
                        {/* {this.state.error && <span>Moving file failed, do you have write permissions?</span>} */}
                    </Collapse>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        className="float-left" variant="secondary" onClick={this.openContainingDirectory} 
                        style={{opacity: copyingComplete ? 1 : 0, transition: '0.2s ease-in-out', marginRight: 'auto'}}
                    >
                        Open <StyledIcon className={"fas fa-external-link-alt"}/>
                    </Button>
                    <Button variant={copyingComplete ? "success" : "danger"} onClick={e => {
                        e.stopPropagation();
                        this.closeExportModal();
                    }} style={{transition: '0.2s ease-in-out'}}>
                        {copyingComplete ? "Close" : "Cancel"}
                    </Button>
                    <Button variant="primary" onClick={e => { e.stopPropagation(); actionFlag == this.ACTION_EXPORT ? this.export() : this.import() }}>
                        {actionFlag == this.ACTION_EXPORT ? "Export" : "Import"}
                    </Button>
                </Modal.Footer>
            </StyledModal>
        </>
        )
    }
}