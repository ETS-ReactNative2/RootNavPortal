// @flow
import fs from 'fs';
import React, { Component } from 'react';
import { Button, Row } from 'react-bootstrap'

import { PLUGINDIR } from '../../constants/globals'
import Plugin from './Plugin';
import { StyledCard, StyledCardHeader, StyledCenterListGroupItem, StyledChevron } from './StyledComponents'
import { StyledIcon } from '../CommonStyledComponents'
import ClearButton from '../buttons/viewer/ClearButton';
import RefreshButton from '../buttons/viewer/RefreshButton';


type Props = {};

export default class RightBar extends Component<Props> {
  props: Props;

  constructor(props) 
  {
    super(props);
    // Todo do this in redux
    const _plugins = this.loadPlugins();
    this.state = {
      ...Object.fromEntries(Object.keys(_plugins).map(group => [group,true])),
      plugins: _plugins,
    };
    console.log(this.state);
  }


  render() {
    return (
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
        </StyledCard>
    );
  }

  loadPlugins() {
    const _require = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require; // Needed for real-time module loading thanks to webpack.
    var plugins = {};

    // If there are no plugins, then make the plugin directory.
    if (!fs.existsSync(PLUGINDIR)) { 
      console.log("No plugin directory found at '" + PLUGINDIR + "', creating!");
      fs.mkdirSync(PLUGINDIR);
    }
    else {
      console.log("Plugin directory found at '" + PLUGINDIR + "', reading plugins!");
      const pluginFilenames = fs.readdirSync(PLUGINDIR); // Get all plugin filenames
      pluginFilenames.forEach(filename => {
        const plugin = _require(`${PLUGINDIR}${filename.replace('.js', '')}`); // For each filename, import the plugin
        if (["name", "group", "function"].every(param => param in plugin)) { // If the plugins have all the necessary members, then add it to the plugins object.
          // Todo good typechecking
          if (!(plugin.group in plugins)) { plugins[plugin.group] = {}; } // Initialise empty object for group
          plugins[plugin.group][plugin.name] = {"function": plugin.function, "active": false};
        }
        else {
          console.log("Bad Plugin: " + JSON.stringify(plugin));
        }
      });
    }
    console.log("Loaded Plugins:");
    console.log(plugins);
    return plugins;
  }

  togglePlugin(groupName, pluginName) {
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
    })
  }

  togglePluginGroup(groupName) {
    if (!this.state.hasOwnProperty(groupName)) return;
    this.setState({
      ...this.state,
      [groupName]: !this.state[groupName]
    })
  }
}