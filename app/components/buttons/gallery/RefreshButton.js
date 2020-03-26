// @flow
import React, { Component } from 'react';
import each from 'async/each';
import { StyledButton } from '../StyledComponents'; 
import { readdir } from 'fs';
import { ALL_EXTS_REGEX, API_PARSE } from '../../../constants/globals'
import TooltipOverlay from '../../common/TooltipOverlay';

export default class RefreshButton extends Component {
    onClick = (folders, files) => {
        let structuredFiles;
        each(folders, (folder, callback) => {
            console.log(folder);
            structuredFiles = {};
            readdir(folder.path, (err, files) => {
                if (!structuredFiles[folder.path]) structuredFiles[folder.path] = {};
				let matched = files.map(file => file.match(ALL_EXTS_REGEX))
					.filter(match => match) // Filter out null values, failed regex match.
                    .map(match => match.groups); //Scan for file types we use
                matched.forEach(regex => { //Structure of this array will be [original string, file name, file extension, some other stuff]
                    if (Object.keys(regex).length) 
                    {
                        let name = regex.fileName; //Each file has an object with the key as the file name
						let ext  = regex.segMask ? regex.segMask.toUpperCase() : regex.ext.toLowerCase(); //if it's a seg mask like file_C1.png we'll get _C1, else we use the actual ext
                        if (!structuredFiles[folder.path][name]) structuredFiles[folder.path][name] = {} // if there is rsml and the png you'll get filename: {rsml: true, png: true}
						structuredFiles[folder.path][name][ext] = true; //This assumes filename stays consistent for variants of the file. They have to, else there'll be no link I guess. 2x check API behaviour on this.
                    }
                });
                callback();
            });
        }, err => {
            if (Object.keys(structuredFiles).length) 
            {
                console.log(structuredFiles);
                if (err) console.error(err)
                else this.props.refreshFiles(structuredFiles); //Add our struct with the folder as the key to state
            }
        } );
    }

    render() {
        return <TooltipOverlay  component={ props => <StyledButton
                variant="primary" 
                className={`btn btn-default fas fa-sync button`} 
                onClick={() => this.onClick(this.props.folders, this.props.files)} 
                {...props}
            />} 
            text={"Reload Folders"}
            placement={"bottom"}
        /> 
    }
}