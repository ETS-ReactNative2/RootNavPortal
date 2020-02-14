// @flow
import React, { Component, useState, useRef } from 'react';
import imageThumbail from 'image-thumbnail';
import { sep } from 'path';
import { ipcRenderer } from 'electron';
import { StyledImage, StyledCardBody, StyledImageCard, StyledCardText } from './StyledComponents'
import { IMAGE_EXTS, IMAGE_EXTS_REGEX } from '../../constants/globals'
import { Spinner, Overlay, Tooltip } from 'react-bootstrap';
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
    }`;

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

    //Generates a spinner with tooltip overlay, which need to be in a function component for state hooks, or nothing
    spinner = () => {
        const [show, setShow] = useState(false);
        const target = useRef(null);
        const { folder, fileName, queue, inFlight } = this.props;

         //Other animation is 'grow'. Border gets a bit crazy when lots get out of sync with each other
        let spinner, tooltipText;
        if (inFlight[folder + sep + fileName])
        {
            spinner = <this.StyledSpinner ref={target} animation="border" variant="success" onMouseEnter={() => setShow(!show)} onMouseLeave={() => setShow(!show)}/>;
            tooltipText = "Currently processing";
        }
        else if (queue.find(file => file.includes(folder + sep + fileName + "."))) //Try avoid files with subset names
        {
            spinner = <this.StyledSpinner ref={target} id={fileName} animation="border" variant="secondary" onMouseEnter={() => setShow(!show)} onMouseLeave={() => setShow(!show)}/>;
            tooltipText = "Queued for processing";
        }

        return (
            <>
                <Overlay target={target.current} show={show} placement="top">
                {({ placement, scheduleUpdate, arrowProps, outOfBoundaries, show: _show, ...props }) => (
                    <Tooltip placement={top} {...props}> {tooltipText} </Tooltip>
                )}
                </Overlay>
                {spinner}
            </>
        )
    }

	render() {
        //folder - the full path to this folder - in state.gallery.folders
        //file - object that contains ext:bool KVs for this file - state.gallery.files[folder][fileName]
        //fileName - the full file name, no extension
        const { folder, file, fileName, addThumb } = this.props;
        if (IMAGE_EXTS.some(ext => ext in file && !(ext + "Thumb" in file))) 
        {
            const ext = Object.keys(file).find(ext => ext.match(IMAGE_EXTS_REGEX));
            
            //Tif files "don't support buffer" apparently, when thumbnailing, so uhh... :shrug:
            imageThumbail.thumb(folder + sep + fileName + "." + ext, { pngOptions: { force: true } }).then(thumb => 
            {
                console.log(thumb);
                addThumb(folder, fileName, { ext, thumb }) //Bundle the thumbnail with the extension so we can label them pngThumb or similar accordingly in case there are multiple thumbs for a file name
            }).catch(err => console.error(err));
        }
        let image;
        Object.keys(file).forEach(key => {
            if (key.includes("Thumb"))
            {
                console.log(file[key]);
                let source = 'data:image/png;base64,' + Buffer.from(file[key]).toString('base64');
                image = <StyledImage className={"card-img-top"} src={ source }/> 
            } 
        });

        return (
            <StyledImageCard className="bg-light" onClick={e => e.stopPropagation()} onDoubleClick={this.openViewer}>
                <div>
                    <this.spinner/>
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
