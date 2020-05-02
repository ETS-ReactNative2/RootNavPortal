// @flow
import React, { Component } from 'react';
import each from 'async/each';
import { StyledButton } from '../StyledComponents'; 
import { readdir } from 'fs';
import { sep } from 'path';
import { ipcRenderer } from 'electron';
import { ALL_EXTS_REGEX, API_PARSE, sendThumbs, _require, IMAGE_EXTS, IMAGES_REMOVED_FROM_GALLERY  } from '../../../constants/globals'
import TooltipOverlay from '../../common/TooltipOverlay';
import { Dropdown } from 'react-bootstrap';

export default class RefreshButton extends Component {

    onClick = () => {
        let structuredFiles;
        let removeThumbnails;
        const { files, folders, refreshFiles, removeThumbs, addThumbs, thumbs } = this.props;
        each(folders, (folder, callback) => {
            structuredFiles = {};
            removeThumbnails = [];
            readdir(folder.path, (err, readFiles) => {
				let matched = readFiles.map(file => file.match(ALL_EXTS_REGEX))
					.filter(match => match) // Filter out null values, failed regex match.
                    .map(match => match.groups) //Scan for file types we use
                    .filter(regex => Object.keys(regex).length);
                matched.forEach(regex => { //Structure of this array will be [original string, file name, file extension, some other stuff]
                    if (!structuredFiles[folder.path]) structuredFiles[folder.path] = {};
                    let name = regex.fileName; //Each file has an object with the key as the file name
                    let ext  = regex.segMask ? regex.segMask.toUpperCase() : regex.ext.toLowerCase(); //if it's a seg mask like file_C1.png we'll get _C1, else we use the actual ext
                    if (!structuredFiles[folder.path][name]) structuredFiles[folder.path][name] = {} // if there is rsml and the png you'll get filename: {rsml: true, png: true}
                    structuredFiles[folder.path][name][ext] = true; //This assumes filename stays consistent for variants of the file. They have to, else there'll be no link I guess. 2x check API behaviour on this.
                });
                // Remove old thumbnails that are no longer needed
                Object.keys(structuredFiles[folder.path] ?? {}).forEach(name => {
                    if (files[folder.path] && Object.keys(files[folder.path][name]).some(key => IMAGE_EXTS.includes(key) && !Object.keys(structuredFiles[folder.path][name]).includes(key))) {
                        removeThumbnails.push({folder: folder.path, filename: name});
                    }
                })
                callback();
            });
        }, err => {
            if (Object.keys(structuredFiles).length) 
            {
                if (err) console.error(err)
                else 
                {
                    let newThumbs = [];
                    refreshFiles(structuredFiles); //Add our struct with the folder as the key to stat
                    Object.entries(structuredFiles).forEach(([folder, files]) => {
                        let filesToParse = [];
                        Object.keys(files).forEach(fileName => {
                            if (structuredFiles[folder][fileName].rsml && !structuredFiles[folder][fileName].parsedRSML) 
                                filesToParse.push(folder + sep + fileName); // Only parse if the folder has RSML, and it hasn't already been parsed!
                        });
                        if (filesToParse.length) ipcRenderer.send(API_PARSE, filesToParse); 
                        newThumbs = newThumbs.concat(Object.keys(files).map(fileName => {
                            if (IMAGE_EXTS.some(ext => ext in structuredFiles[folder][fileName]) && thumbs && thumbs[folder] && !thumbs[folder][fileName])
                            {
                                const { parsedRSML, _C1, _C2, rsml, ...exts } = structuredFiles[folder][fileName];
                                return { folder, file: exts, fileName };
                            }
                        }));
                    });
                    if (newThumbs.length)
                        sendThumbs(newThumbs.filter(item => item !== undefined), addThumbs);
                    if (removeThumbnails.length) {
                        ipcRenderer.send(IMAGES_REMOVED_FROM_GALLERY, removeThumbnails);
                        removeThumbs(removeThumbnails); // Remove old thumbnails.
                    }
                }
            }
        });
    }

    render() {
        return this.props.isDropdown 
        ? <Dropdown.Item style={{opacity: 1}} onClick={() => this.onClick()}>Refresh</Dropdown.Item>
        : <TooltipOverlay  component={ props => <StyledButton
                variant="primary" 
                className={`btn btn-default fas fa-sync button`} 
                onClick={() => this.onClick()} 
                {...props}
            />} 
            text={"Reload Folders"}
            placement={"bottom"}
        /> 
    }
}