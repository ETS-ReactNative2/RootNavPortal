// @flow
import fs from 'fs';
import React, { Component } from 'react';
import { Button, Row, Modal, InputGroup } from 'react-bootstrap'
import { PLUGINDIR, _require } from '../../constants/globals'
import Plugin from './Plugin';
import { StyledCard, StyledCardHeader, StyledCenterListGroupItem, StyledChevron } from './StyledComponents'
import { StyledIcon } from '../CommonStyledComponents'
import ClearButton from '../buttons/viewer/ClearButton';
import RefreshButton from '../buttons/viewer/RefreshButton';
import SelectDestinationButton from '../buttons/viewer/SelectDestinationButton';
import styled from 'styled-components';
import { StyledModal } from '../buttons/StyledComponents'; 
import { ipcRenderer } from 'electron';

export default class PluginBar extends Component {
    constructor(props) 
    {
        super(props);
        // Todo do this in redux
        const _plugins = this.loadPlugins();
        this.state = {
            ...Object.fromEntries(Object.keys(_plugins).map(group => [group,true])),
            plugins: _plugins,
            modal: false
        };
        this.exportDest = React.createRef();
        console.log(this.state);
    }

    measureButton = styled(Button)`
        position: absolute;
        bottom: 0;
        width: -webkit-fill-available;
        transitionDuration: 0.4s;
    `;

    render() {
        let pluginActive = Object.keys(this.state.plugins).some(group => Object.values(this.state.plugins[group]).some(plugin => plugin.active));
        return (
        <>
            <StyledCard>
                <StyledCenterListGroupItem>
                    <RefreshButton/>
                    <ClearButton/>
                </StyledCenterListGroupItem>
                {
                    Object.entries(this.state.plugins).map((pluginGroup, i) => {
                        const groupName = pluginGroup[0];
                        return (
                        <React.Fragment key={i}>
                            <StyledCardHeader variant="light" as={Button} onClick={() => this.togglePluginGroup(groupName)}>
                                <div className="container">
                                    <Row>
                                        <StyledChevron className="col-3">
                                            <StyledIcon className={"fas fa-chevron-" + (this.state[groupName] ?  "down" : "right") + " fa-lg"}/>
                                        </StyledChevron>
                                    <div className="col-9">
                                        {groupName} Measurements
                                    </div>
                                    </Row>
                                </div>
                            </StyledCardHeader>
                        {
                            this.state[groupName] ? Object.entries(pluginGroup[1]).map((plugin, i) => {
                                return <div key={i} onClick = {() => this.togglePlugin(groupName, plugin[0])}>
                                    <Plugin 
                                        key={i} 
                                        name={plugin[0]} 
                                        func={plugin[1].function} 
                                        active={plugin[1].active}/>
                                </div>
                            }) : ""
                        }
                        </React.Fragment>
                        );
                    })
                }    
                <this.measureButton variant={pluginActive ? "primary" : "secondary"} onClick={this.measure} disabled={!pluginActive}>Measure</this.measureButton>
            </StyledCard>

            <StyledModal show={this.state.modal} onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Export Measurements</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <InputGroup>
                        <InputGroup.Prepend>
                            <InputGroup.Text><StyledIcon className={"fas fa-save fa-lg"}/></InputGroup.Text> 
                        </InputGroup.Prepend>
                        <input key={0} type="text" className="form-control" readOnly ref={this.exportDest}/>
                    </InputGroup>
                    <SelectDestinationButton inputRef={this.exportDest}/>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={this.closeModal}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={this.export}>
                        Measure
                    </Button>
                </Modal.Footer>
            </StyledModal> 
        </>
        );
    }

    //Modal's measure button clicked
    export = () => {
        if (!this.exportDest.current.value) return;
        let funcs = [];
        let folders = ["C:\\Users\\Andrew\\Desktop\\hkj\\ouptput", "C:\\Users\\Andrew\\Desktop\\hkj\ouptput\\temp"]; //Get this from state when sidebar is done

        //Todo: Move RSML parsing from Render to (probably) the backend on importing the FolderView. This is because we need the parsedRSML for measuring
        //Which currently is JiT parsed on inspecting in the viewer. Also sets up our transition to canvases on the gallery nicely too, since we won't get bogged by async parsing
        //Also anything that needs it will get its props updated by the backend's redux action putting it back to state.
        folders.forEach(folder => { //For each folder we get passed by the sidebar - this will be in Redux
            Object.values(this.props.files[folder]).forEach(file => { //For each file inside state for that folder
                if (file.parsedRSML) Object.values(this.state.plugins).forEach(group =>  //if we have rsml, for each plugin group
                    Object.values(group).forEach(plugin => plugin.active ? //for each active plugin
                        funcs.push(plugin.function(file.parsedRSML.rsmlJson, file.parsedRSML.polylines)) : null)); //pass the data to each plugin
            });
        });

        //Plugins return a promise which they then resolve when they finish their processing.
        Promise.all(funcs).then(results => {
            console.log(results);
        });

        console.log(this.exportDest.current.value);
    };

    closeModal = () => {
        this.setState({...this.state, modal: false});
        ipcRenderer.removeListener('exportDest');
    };

    //Plugin measure clicked, opens modal
    measure = e => {
        this.setState({ ...this.state, modal: true });
    };
    
    loadPlugins = () => {
        let plugins = {};

        // If there are no plugins, then make the plugin directory.
        if (!fs.existsSync(PLUGINDIR)) { 
            console.log("No plugin directory found at '" + PLUGINDIR + "', creating!");
            fs.mkdirSync(PLUGINDIR);
        }
        else 
        {
            console.log("Plugin directory found at '" + PLUGINDIR + "', reading plugins!");
            const pluginFilenames = fs.readdirSync(PLUGINDIR); // Get all plugin filenames
            pluginFilenames.forEach(filename => {
                const plugin = _require(`${PLUGINDIR}${filename.replace('.js', '')}`); // For each filename, import the plugin
                
                if (["name", "group", "function"].every(param => param in plugin)) { // If the plugins have all the necessary members, then add it to the plugins object.
                    // Todo good typechecking
                    if (!(plugin.group in plugins)) plugins[plugin.group] = {}; // Initialise empty object for group
                    plugins[plugin.group][plugin.name] = {"function": plugin.function, "active": false};
                }
                else console.log("Bad Plugin: " + JSON.stringify(plugin));
            });
        }
        console.log("Loaded Plugins:");
        console.log(plugins);
        return plugins;
    }

    togglePlugin = (groupName, pluginName) => {
        const { plugins } = this.state;
        console.log(plugins[groupName]);
        if (!plugins.hasOwnProperty(groupName) || !plugins[groupName].hasOwnProperty(pluginName)) return;
        this.setState({
            ...this.state,
            plugins: {
                ...plugins,
                [groupName]: {
                    ...plugins[groupName],
                    [pluginName]: {
                    ...plugins[groupName][pluginName],
                    'active': !plugins[groupName][pluginName].active
                    }
                } 
            }
        });
    }

    togglePluginGroup = groupName => {
        if (!this.state.hasOwnProperty(groupName)) return;
        this.setState({
            ...this.state,
            [groupName]: !this.state[groupName]
        });
    };
}