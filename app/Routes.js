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
const { Menu } = remote;

export default class Routes extends Component {

    constructor(props)
    {
        super(props);
        this.state = { openCollapse: false, changeSaveAnimation: false };

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
        let { page = "", path = "", exts = "" } = props.location.search.match(/(?<page>\?[^?]+)\??(?<path>[^|]+)?\|?(?<exts>.+)?/).groups //This matches the passed URL into 3 groups - ?viewer, ?folder/filepath, and |rsml|png|etc. The negated sets are to delimit the capture groups
        path = path.replace(/%20/g, " "); //Replace any encoded spaces in the file path with a space.
        exts = exts.split('|');

        let view = Routes.Views(path, exts)[page];
        if (view == null) 
            view = Routes.Views()[routes.HOME];
        return view;
    }

    saveSettings = () => {
        let apiAddress = this.address.current.value;
        let port       = this.port.current.value;
        let apiKey     = this.apiKey.current.value;
        if (!apiAddress || !port || !apiKey) return; //Maybe do some form validation here later 

        this.setState({ ...this.state, openCollapse: true });
        this.props.saveAPISettings(apiAddress + ":" + port, apiKey);

        writeConfig(JSON.stringify({ apiAddress: apiAddress + ":" + port, apiKey, folders: this.props.folders }, null, 4));
        setTimeout(() => this.setState({ ...this.state, changeSaveAnimation: true }), 225); //checkmark animation delay
    };

    render() {
        const { address, apiKey} = this.props;
        const { serverIP = "", serverPort = "" } = address ? address.match(/(?<serverIP>.+):(?<serverPort>.+)/).groups : {}
        return (
            <Router>
            <div>
                <Route path='/' component={Routes.View}/>
                <Modal show={true} show={this.props.apiModal} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Server Settings</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <InputGroup>
                            <input key={0} type="text" defaultValue={serverIP} className="form-control" placeholder="https://server.location" ref={this.address}/>
                            <InputGroup.Append><InputGroup.Text><b>:</b></InputGroup.Text></InputGroup.Append> 
                            <InputGroup.Append>
                                {/* Considering putting minWidth 7em on this input, so the URL is bigger and port is shorter, but I also like the symmetry as it is currently. */}
                                <input key={1} type="text" defaultValue={serverPort} className="form-control" placeholder="port" ref={this.port} style={{ borderBottomLeftRadius: '0', borderTopLeftRadius: '0' }}/> 
                            </InputGroup.Append>
                        </InputGroup>
                        <input key={0} type="text" defaultValue={apiKey} className="form-control" placeholder="Server Key" ref={this.apiKey} style={{marginTop: '1em'}}/>      
                        <Collapse in={this.state.openCollapse}>
                            <div>
                                <div style={{ display: 'flex' }} className={"circle-loader" + (this.state.changeSaveAnimation ? " load-complete" : "")}>
                                    <div style={this.state.changeSaveAnimation ? {display: 'block'} : {display: 'none'}} className={(this.state.changeSaveAnimation ? "checkmark " : "") + "draw"}></div>
                                </div>
                            </div>
                        </Collapse>
                    </Modal.Body>
                    <Modal.Footer>
                    { this.props.apiStatus ? <span>Server is available <i className="fas fa-check-circle" style={{color: '#5cb85c', marginRight: '0.25em', fontSize: '1.2em'}}/></span> : ""}
                    <Button variant={this.state.changeSaveAnimation ? "success" : "danger"} onClick={this.closeModal} style={{transition: '0.2s ease-in-out'}}>
                        {this.state.changeSaveAnimation ? "Close" : "Cancel"}
                    </Button>
                        <Button variant="primary" onClick={this.saveSettings}>
                            Save
                        </Button>
                    </Modal.Footer>
                </Modal> 
            </div>
            </Router>
        );
    }

    menuTemplate = [
        {
            label: '&File',
            submenu: [
                {
                    label: "&Server Settings",
                    accelerator: 'Ctrl+P',
                    click: () => this.props.updateAPIModal(true)
                }
            ]
        }
    ];
}