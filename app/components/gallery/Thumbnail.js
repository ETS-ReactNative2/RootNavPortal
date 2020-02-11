// @flow
import React, { Component } from 'react';
import imageThumbail from 'image-thumbnail';
import { sep } from 'path';
import { ipcRenderer } from 'electron';
import { StyledImage, StyledCardBody, StyledImageCard, StyledCardText } from './StyledComponents'
import { IMAGE_EXTS, IMAGE_EXTS_REGEX } from '../../constants/globals'
import { Spinner } from 'react-bootstrap';
import styled from 'styled-components';

export default class Thumbnail extends Component<Props> {
    windowObject = null;

    StyledSpinner = styled(Spinner)` && {
        position: absolute;
        right: 0.3em;
        top: 0.1em;
    }`;

    StyledTextOverflowContainer = styled.div` && {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }`

    openViewer = e => 
    {
        if (!this.windowObject) 
        {
            const { folder, file, fileName } = this.props;
            if (IMAGE_EXTS.some(ext => ext in file)) 
            {
                ipcRenderer.send('openViewer', folder + sep + fileName + "|" + Object.keys(file).filter(string => !string.includes("Thumb")).join("|"), () => {}) //| is the delimeter for file extensions in the URL bar
            }
        }
    }

	render() {
        //folder - the full path to this folder - in state.gallery.folders
        //file - object that contains ext:bool KVs for this file - state.gallery.files[folder][fileName]
        //fileName - the full file name, no extension
        const { folder, file, fileName, addThumb, queue, inFlight } = this.props;
        if (IMAGE_EXTS.some(ext => ext in file && !(ext + "Thumb" in file))) 
        {
            const ext = Object.keys(file).find(ext => ext.match(IMAGE_EXTS_REGEX));
            
            //Tif files "don't support buffer" apparently, when thumbnailing, so uhh... :shrug:
            imageThumbail.thumb(folder + sep + fileName + "." + ext, { pngOptions: { force: true } }).then(thumb => 
            {
                addThumb(folder, fileName, {ext: ext, thumb}) //Bundle the thumbnail with the extension so we can label them pngThumb or similar accordingly in case there are multiple thumbs for a file name
            }).catch(err => console.error(err));
        }

        let image;
        Object.keys(file).forEach(key => {
            if (key.includes("Thumb"))
            {
                let source = 'data:image/png;base64,' + file[key].toString('base64');
                image = <StyledImage className={"card-img-top"} src={ source }/> 
            }
        });

        let spinner;
        if (inFlight[folder + sep + fileName])
            spinner = <this.StyledSpinner animation="border" variant="success" />; //Other animation is 'grow'. Border gets a bit crazy when lots get out of sync with each other
        else if (queue.find(file => file.includes(folder + sep + fileName + "."))) //Try avoid files with subset names
            spinner = <this.StyledSpinner animation="border" variant="secondary"/>;

        return (
            <StyledImageCard className="bg-light" onClick={e => e.stopPropagation()} onDoubleClick={this.openViewer}>
                <div>
                    {spinner}
                    {image}
                </div>
                <StyledCardBody>
                    <StyledCardText>
                        <this.StyledTextOverflowContainer>
                            {fileName}
                        </this.StyledTextOverflowContainer>
                    </StyledCardText>
                </StyledCardBody>
            </StyledImageCard>            
		);
	}
}
