// @flow
import React, { Component } from 'react';
import '../common.css';
import each from 'async/each';
import { StyledButton } from './StyledComponents'; 

class RefreshButton extends Component {
    structuredFiles = {};

    onClick = () => {
        each(folders, (folder, callback) => {
            readdir(folder, (err, files) => {
                if (!this.structuredFiles[folder]) this.structuredFiles[folder] = {};

                let matched = files.map(file => file.match(/(.+)\.(rsml|txt|png|jpg|jpeg)$/)) //Scan for file types we use
                matched.forEach(regex => { //Structure of this array will be [original string, file name, file extension, some other stuff]
                    if (regex) 
                    {
                        let name = regex[1]; //Each file has an object with the key as the file name
                        let ext = regex[2];  //that key's value is an object that holds the extensions we found as bools
                        if (!this.structuredFiles[folder][name]) this.structuredFiles[folder][name] = {} // if there is rsml and the png you'll get filename: {rsml: true, png: true}

                        this.structuredFiles[folder][name][ext] = true; //This assumes filename stays consistent for variants of the file. They have to, else there'll be no link I guess. 2x check API behaviour on this.
                    }
                });
                callback();
            }), err => {
                if (Object.keys(this.structuredFiles).length) 
                {
                    if (err) console.error(err)
                    else this.props.refreshFiles(this.structuredFiles); //Add our struct with the folder as the key to state
                }
            };
        });
    }
    render() {
        const { folders, files } = this.props;
        
        return (
            <StyledButton
                variant="primary" 
                className={`btn btn-default fas fa-sync button`} 
                onClick={this.refresh}
            />    
        )
    }
}

export default RefreshButton;