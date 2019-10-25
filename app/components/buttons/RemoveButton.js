// @flow
import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';
import '../common.css';
import { APPHOME, CONFIG } from '../../constants/globals';
import { existsSync, writeFile } from 'fs';
class RemoveButton extends Component {

    render() {
        const StyledButton = styled(Button)` && {
            width: 2.5em;
            height: 2.5em;
            max-width: 2.5em;
            min-width: 2.5em;
            max-height: 2.5em;
            min-height: 2.5em;
            padding: 6px 0px;
            text-align: center;
            font-size: 20px;
            border-radius: 30px;
            margin: 0px 10px;
        }`
    
        const deleteFolder = () => {
            console.log(this.props);
            if (!this.props.path) return;

            const filteredPaths = this.props.folders.filter(path => path != this.props.path);
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