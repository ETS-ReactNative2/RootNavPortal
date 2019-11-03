// @flow
import React, { Component } from 'react';
import '../common.css';
import { APPHOME, CONFIG } from '../../constants/globals';
import { existsSync, writeFile } from 'fs';
import { StyledButton } from './StyledComponents'; 

class RemoveButton extends Component {

    render() {    
        const deleteFolder = () => {
            console.log(this.props);
            if (!this.props.path) return;
            const filteredPaths = this.props.folders.filter(folder => folder.path !== this.props.path);
            if (existsSync(APPHOME))    //Rewrite config file with removed directories so they don't persist
                writeFile(APPHOME + CONFIG , JSON.stringify(filteredPaths, null, 4), err => {
                    if (err) console.log(err); //idk do some handling here
                });

            this.props.remove(this.props.path);
        }
    
        return (
            <StyledButton
                variant="danger" 
                onClick={deleteFolder} 
                className={`btn btn-default fas fa-trash-alt button`} 
            />    
        )
    }
}

export default RemoveButton;