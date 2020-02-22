// @flow
import React, { Component } from 'react';
import { APPHOME, CONFIG } from '../../../constants/globals';
import { existsSync, writeFile } from 'fs';
import { StyledButton } from '../StyledComponents'; 

export default class RemoveButton extends Component {

    deleteFolder = () => {
        const { folders, path } = this.props;
        if (!path) return;
        const filteredPaths = folders.filter(folder => folder.path !== path);
        if (existsSync(APPHOME))    //Rewrite config file with removed directories so they don't persist
            writeFile(APPHOME + CONFIG , JSON.stringify(filteredPaths, null, 4), err => {
                if (err) {
                    console.err("Could not delete folder '" + path + "'!");
                    console.err(err);
                }
            });
        this.props.remove(path);
    }
    
    render() { 
        return (
            <StyledButton
                variant="danger" 
                onClick={e => {
                    this.deleteFolder();
                    e.stopPropagation()
                }} 
                className={`btn btn-default fas fa-trash-alt button`} 
            />    
        )
    }
}