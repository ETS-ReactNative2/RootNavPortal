// @flow
import React, { Component } from 'react';
import TopBar from '../containers/gallery/TopBarContainer';
import GalleryView from '../containers/gallery/GalleryViewContainer';
import { existsSync, readFile } from 'fs';
import { writeConfig, APPHOME, CONFIG, DEFAULT_CONFIG } from '../../constants/globals';
import { remote } from 'electron';

export default class Gallery extends Component {
    constructor(props)
    {
        super(props);
        remote.getCurrentWindow().on('close', () => {
            writeConfig(JSON.stringify({ apiAddress: this.props.apiAddress, apiKey: this.props.apiKey, folders: this.props.folders }, null, 4))
        });
    }

    render() {

        if (!this.props.hasReadConfig) 
        {
            if (existsSync(APPHOME + CONFIG)) 
            {
                readFile(APPHOME + CONFIG, "utf8", (err, data) => 
                {
                    if (err) console.error(err); 
                    else 
                    {
                        let config = null;
                        try {
                            config = JSON.parse(data);
                        } catch (e) {
                            console.error("Error parsing config! Setting to empty.");
                            writeConfig(JSON.stringify(DEFAULT_CONFIG));
                            config = DEFAULT_CONFIG;
                        }
                        this.props.importConfig(config.folders.sort((a, b) => a.path.localeCompare(b.path)), config.apiAddress, config.apiKey);
                    }
                }); 
            }
            else {
                console.error("Error parsing config! Appears to be missing, setting to empty.");
                writeConfig(JSON.stringify(DEFAULT_CONFIG));
            }   
        }

        return (
            <div data-tid="container">
                <TopBar />
                <GalleryView />
            </div>
        );
    }
}
