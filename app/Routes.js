import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom'
import routes from './constants/routes';
import GalleryPage from './containers/GalleryPage';
import ViewerPage from './containers/ViewerPage';
import Backend from './containers/Backend';
import { remote } from 'electron';
import { Button, Modal, InputGroup, Collapse } from 'react-bootstrap';
import { writeConfig, _require } from './constants/globals';
import styled from 'styled-components';
const { Menu } = remote;
import os from 'os';
import { exec } from 'child_process';

export default class Routes extends Component {

    StyledPort = styled.input`
        border-bottom-left-radius: 0;
        border-top-left-radius: 0; 
        width: 6.5vw; 
        &::-webkit-inner-spin-button, &::-webkit-outer-spin-button {
            -webkit-appearance: none;
        }
    `;
    StyledI = styled.i`
        color: #5cb85c;
        margin-right: 0.25em;
        font-size: 1.2em;
    `;
    
    constructor(props)
    {
        super(props);
        this.state = { openCollapse: false, changeSaveAnimation: false, validateWarning: false, infoModal: false };

        const menu = Menu.buildFromTemplate(this.menuTemplate);
        remote.getCurrentWindow().setMenu(menu);
        this.address = React.createRef(); 
        this.port    = React.createRef();
        this.apiKey  = React.createRef();
    }

    closeModal = () => {
        this.props.updateAPIModal(false);
        this.setState({ openCollapse: false, changeSaveAnimation: false });
    };

    static Views(tag = "", exts = "") {
        return {
            [routes.GALLERY]: <GalleryPage/>,
            [routes.VIEWER]:  <ViewerPage path={tag} exts={exts}/>,
            [routes.BACKEND]: <Backend />,
            [routes.HOME]: <GalleryPage/>
        };
    }

    static View(props) {
        let { page = "", path, exts = "" } = props.location.search.match(/(?<page>\?[^?]+)\??(?<path>[^|]+)?\|?(?<exts>.+)?/).groups //This matches the passed URL into 3 groups - ?viewer, ?folder/filepath, and |rsml|png|etc. The negated sets are to delimit the capture groups
        path = path ? path.replace(/%20/g, " ") : path; //Replace any encoded spaces in the file path with a space.
        exts = exts.split('|');

        return Routes.Views(path, exts)[page] || Routes.Views()[routes.HOME];
    }

    saveSettings = () => {
        this.setState({ changeSaveAnimation: false }); // Reset save checkbox so it repeats the tick animation each time.
        let apiAddress = this.address.current.value;
        let port       = this.port.current.value;
        let apiKey     = this.apiKey.current.value;
        if (!apiAddress || !apiKey) //Allow for port to be left empty in case it'll default to 80/443
        {
            this.setState({ validateWarning: true });
            return; //Maybe do some form validation here later 
        }
        this.setState({ openCollapse: true, validateWarning: false });
        this.props.saveAPISettings(apiAddress + (port ? ":" : "") + port, apiKey);

        writeConfig(JSON.stringify({ apiAddress: apiAddress + (port ? ":" : "") + port, apiKey, folders: this.props.folders }, null, 4));
        setTimeout(() => this.setState({ changeSaveAnimation: true }), 225); //checkmark animation delay
    };

    render() {
        const { address, apiKey} = this.props;
        const { proto = "", serverIP = "", serverPort = "" } = address ? address.match(/(?<proto>https?:\/\/)?(?<serverIP>[^:]+)(?::(?<serverPort>.+))?/).groups : {}
        return (
            <Router>
            <div>
                <Route path='/' component={Routes.View}/>
                <Modal show={this.props.apiModal} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Server Settings</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <InputGroup>
                            <input style={this.state.validateWarning ? { boxShadow: '0 0 10px red', borderRadius: '3px' } : {}} key={0} type="text" defaultValue={proto + serverIP} className="form-control" placeholder="https://server.location" ref={this.address}/>
                            <InputGroup.Append><InputGroup.Text><b>:</b></InputGroup.Text></InputGroup.Append> 
                            <InputGroup.Append>
                                <this.StyledPort key={1} type="number" defaultValue={serverPort} className="form-control" placeholder="port" ref={this.port} /> 
                            </InputGroup.Append>
                        </InputGroup>
                        <input key={0} type="text" defaultValue={apiKey} className="form-control" placeholder="Server Key" ref={this.apiKey} style={Object.assign(this.state.validateWarning ? { boxShadow: '0 0 10px red' } : {}, { marginTop: '1em' }) }/>      
                        <Collapse in={this.state.openCollapse}>
                            <div>
                                <div style={{ display: 'flex' }} className={"circle-loader" + (this.state.changeSaveAnimation ? " load-complete" : "")}>
                                    <div style={this.state.changeSaveAnimation ? {display: 'block'} : {display: 'none'}} className={(this.state.changeSaveAnimation ? "checkmark " : "") + "draw"}></div>
                                </div>
                            </div>
                        </Collapse>
                    </Modal.Body>
                    <Modal.Footer>
                    { this.props.apiStatus ? <span>Server is available <this.StyledI className="fas fa-check-circle"/></span> : ""}
                    <Button variant={this.state.changeSaveAnimation ? "success" : "danger"} onClick={this.closeModal} style={{transition: '0.2s ease-in-out'}}>
                        {this.state.changeSaveAnimation ? "Close" : "Cancel"}
                    </Button>
                        <Button variant="primary" onClick={this.saveSettings}>
                            Save
                        </Button>
                    </Modal.Footer>
                </Modal> 

                <Modal show={this.state.infoModal} onHide={() => this.setState({ infoModal: false })}>
                    <Modal.Header closeButton>
                        <Modal.Title>Application Info <span><this.StyledI style={{verticalAlign: 'text-top'}} className="fas fa-info-circle"/></span></Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <b>RootNav Portal</b> version {remote.app.getVersion()}
                        <br/><hr/>
                        <b>Maintainers:</b>
                        <ul>
                            <li><b>Andrew Reynolds</b>: andrew.n64@hotmail.com</li>
                            <li><b>Daniel Cordell</b>: danielbc@hotmail.co.uk</li>
                            <li><b>Mike Pound</b>: sbzmpp@exmail.nottingham.ac.uk</li>
                        </ul>
                        For suggestions, feature requests or bug reports, please file an issue at <a style={{color: '#0000EE'}} onClick={() => exec(`${process.platform == 'win32' ? "start" : "open"} https://github.com/Chagrilled/RootNavPortal`)}>
                            RootNav Portal's GitHub repository</a> or email a maintainer.
                        <br/><hr/>
                        <b>Electron</b>: {process.versions['electron']}<br/>
                        <b>Chrome</b>: {process.versions['chrome']}<br/>
                        <b>Node</b>: {process.versions['node']}<br/>
                        <b>OS</b>: {`${os.type()} ${os.arch()} ${os.release()}`}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={() => this.setState({ infoModal: false })}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal> 
            </div>
            </Router>
        );
    }

    menuTemplate = [
        {
            label: '&Menu',
            submenu: [
                {
                    label: "&Server Settings",
                    accelerator: 'Ctrl+P',
                    click: () => { this.props.updateAPIModal(true); this.setState({ infoModal: false }) }
                },
                {
                    label: "&About",
                    accelerator: 'Ctrl+I',
                    click: () => { this.setState({ infoModal: true }); this.props.updateAPIModal(false) }
                }
            ]
        },
    ];
}