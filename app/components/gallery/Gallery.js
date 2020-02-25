// @flow
import React, { Component } from 'react';
import TopBar from '../containers/gallery/TopBarContainer';
import GalleryView from '../containers/gallery/GalleryViewContainer';
import { existsSync, writeFile, readFile } from 'fs';
import { APPHOME, CONFIG } from '../../constants/globals';
import { remote } from 'electron';

export default class Gallery extends Component {
    constructor(props)
    {
        super(props);
        if (remote.getGlobal('API_STATUS')) process.env.API_STATUS = true;
        remote.getCurrentWindow().on('close', () => {
            this.saveConfig();
        });
    }

    saveConfig() {
        if (existsSync(APPHOME)) // If somehow the app home dir got deleted, don't write config!
            writeFile(APPHOME + CONFIG , JSON.stringify(this.props.folders, null, 4), err => {
                if (err) {
                    console.err("Could not write config!");
                    console.err(err);
                }
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
                    else this.props.importConfig(JSON.parse(data).sort((a, b) => a.path.localeCompare(b.path)));
                }); 
            }
            else console.error("doesn't exist: " + APPHOME+CONFIG);     
        }

        return (
            <div data-tid="container">
                <TopBar />
                <GalleryView />
            </div>
        );
    }
}
