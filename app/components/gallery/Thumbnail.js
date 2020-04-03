// @flow
import React, { Component, useState, useRef } from 'react';
import { sep } from 'path';
import { ipcRenderer } from 'electron';
import { StyledImageCard } from './StyledComponents'
import { IMAGE_EXTS, API_THUMB, THUMB_PERCENTAGE, COLOURS } from '../../constants/globals'
import { Spinner, Overlay, Tooltip } from 'react-bootstrap';
import styled from 'styled-components';
import CollapsableLabel from '../containers/gallery/CollapsableLabelContainer';
import { fabric } from 'fabric'; //Fabric will give you node-gyp build errors, but it's fine, because we're actually a browser. :electrongottem:
import sizeOf from 'image-size';

export default class Thumbnail extends Component {
    constructor(props)
    {
        super(props);
        this.canvasID = [...Array(5)].map(() => Math.random().toString(36)[2]).join(''); //Make a random canvas ID so we can open multiple and recreating isn't a problem
        this.container = React.createRef();
        this.timer = null;
        this.fabricCanvas = new fabric.Canvas(this.canvasID, { selection: false }); 

        //On resize, force a refresh so our canvas can update its image to fit the containing div.
        window.addEventListener('resize', e => {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => this.forceUpdate(), 50)
        });
    }

    StyledSpinner = styled(Spinner)` && {
        position: absolute;
        right: 0.3em;
        top: 0.1em;
    }`;

    LoadingSpinner = styled(Spinner)` && {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
    }`;

    openViewer = e => 
    {
        const { folder, file, fileName } = this.props;
        if (IMAGE_EXTS.some(ext => ext in file) && this.hasRSML()) 
        {
            ipcRenderer.send('openViewer', folder + sep + fileName + "|" + Object.keys(file).filter(string => !string.includes("Thumb")).join("|"), () => {}) //| is the delimeter for file extensions in the URL bar
        }
    }

    shouldComponentUpdate(nextProps, nextState) 
    {
        if (!nextProps.active) return false; //Don't rerender if the parent folder is closed
        if (nextProps.labels != this.props.labels) return false; //If the label changes, we don't want to update with the rest of the container
        return true; //so the label collapse animation is still smooth as the canvas won't redraw unnecessarily
    }

    componentDidUpdate(prevProps)
    {   
        this.setupCanvas();
        this.draw();
    }

    componentDidMount()
    {
        this.setupCanvas();
        this.draw();    
    }

    setupCanvas = () => {
        this.fabricCanvas.initialize(document.getElementById(this.canvasID), { width: this.container.current.clientWidth, height: this.container.current.clientHeight });
        this.fabricCanvas.setDimensions({ width: this.container.current.clientWidth, height: this.container.current.clientHeight }, { backstoreOnly: true });
        this.fabricCanvas.hoverCursor = this.hasRSML() ? 'pointer' : 'not-allowed';
        //this.fabricCanvas.setDimensions({ width: '100%', height: '100%' }, { cssOnly: true }); 
    };

    getBuffer = file => {
        let ext;
        Object.keys(file).forEach(key => { if (key.includes("Thumb")) ext = key });
        return ext ? Buffer.from(file[ext]) : null;
    }

    draw = () => {
        console.log("I am drawing a thumbnail");
        const { file, architecture } = this.props;
        const polylines = file.parsedRSML ? file.parsedRSML.polylines : null;
        let image = new Image();
        const buffer = this.getBuffer(file);
        if (!buffer) return;
        image.src = 'data:image/png;base64,' + buffer.toString('base64'); //Otherwise we can just ref the file path normally
        image.onload = () => {
            let im = new fabric.Image(image, {
                left: 0, top: 0, selectable: false
            });

            im.scaleToHeight(this.container.current.clientHeight); //Scale the image towards the containing divs size. 
            im.scaleToWidth(this.container.current.clientWidth); //Perhaps not great, but I can't think of a better way. The sizing issue is circular.
            this.fabricCanvas.add(im);

            if (polylines && architecture) this.drawRSML(polylines, im.getObjectScaling()); //Pass the scale factor through so the RSML can calc the right offset
        };     
    };

    drawRSML = (polylines, scaling) => {

        polylines.forEach(line => {   //Each sub-array is a line of point objects - [ line: [{}, {} ] ]
            let polyline = new fabric.Polyline(line.points.map(point => ({ x: point.x * THUMB_PERCENTAGE * scaling.scaleX / 100, y: point.y * THUMB_PERCENTAGE * scaling.scaleY / 100 })), {
                stroke: line.type == 'primary' ? COLOURS.PRIMARY : COLOURS.LATERAL,
                fill: null,
                strokeWidth: 2,
                perPixelTargetFind: true,
                name: line.id,
                lockMovementX: true,
                lockMovementY: true,
                strokeLineCap: "round",
                hasControls: false,
                selectable: false
            });
            this.fabricCanvas.add(polyline);
        });
    };

    //Generates a spinner with tooltip overlay, which need to be in a function component for state hooks, or nothing
    spinner = () => {
        const [show, setShow] = useState(false);
        const target = useRef(null);
        const { folder, fileName, queue, inFlight, model, apiStatus } = this.props;
        if (!apiStatus) return "";  //Disable all spinner notifications if no API connection - red model alert might still be relevant, but I don't think it's worth showing.

        let spinner, tooltipText;
        if (!model)
        {
            spinner = <this.StyledSpinner ref={target} animation="grow" variant="danger" onMouseEnter={() => setShow(!show)} onMouseLeave={() => setShow(!show)}/>;
            tooltipText = "Please select a model from the folder settings to process these files";
        }
        else if (inFlight[folder + sep + fileName])
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
    
    FabricCanvas = () => {
        return <canvas id={this.canvasID}></canvas>
    };

    hasRSML = () => "rsml" in this.props.file;

	render() {
        //folder - the full path to this folder - in state.gallery.folders
        //file - object that contains ext:bool KVs for this file - state.gallery.files[folder][fileName]
        //fileName - the full file name, no extension
        const { file, fileName } = this.props;

        // Dispose of the canvas and redraw
        if (this.fabricCanvas)
            this.fabricCanvas.dispose();

        let ext = Object.keys(file).find(key => key.match(/^.{0,4}Thumb$/));
        const buffer = this.getBuffer(file);
        const imageSize = buffer && sizeOf(buffer);

        const baseVH = Math.round(window.innerHeight / 100);
        //The minHeight on the div is bad and should somehow change to something regarding the size of the image maybe
        return (
            <StyledImageCard clickable={this.hasRSML() ? 1 : 0} className="bg-light" onClick={e => {e.stopPropagation(); this.openViewer()}}>
                <div style={imageSize ? {minWidth: `${baseVH * 25}px`, minHeight: `${imageSize.height / imageSize.width * (baseVH * 25)}px`} : {}} ref={this.container}>
                    <this.FabricCanvas />
                    <this.spinner/>
                    { !ext ? <this.LoadingSpinner animation="border" variant="primary" /> : "" }
                </div>
                <CollapsableLabel file={fileName}/>
            </StyledImageCard> 
		);
	}
}
