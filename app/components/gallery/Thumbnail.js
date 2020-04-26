// @flow
import React, { Component, useState, useRef } from 'react';
import { sep } from 'path';
import { ipcRenderer, remote } from 'electron';
import { StyledImageCard } from './StyledComponents'
import { IMAGE_EXTS, IMAGE_EXTS_REGEX, THUMB_PERCENTAGE, COLOURS } from '../../constants/globals'
import { Spinner, Overlay, Tooltip } from 'react-bootstrap';
import styled from 'styled-components';
import CollapsableLabel from '../containers/gallery/CollapsableLabelContainer';
import { fabric } from 'fabric'; //Fabric will give you node-gyp build errors, but it's fine, because we're actually a browser. :electrongottem:
import sizeOf from 'image-size';

const { Menu, MenuItem } = remote;

export default class Thumbnail extends Component {
    constructor(props)
    {
        super(props);
        this.canvasID = [...Array(8)].map(() => Math.random().toString(36)[2]).join(''); //Make a random canvas ID so we can open multiple and recreating isn't a problem
        this.container = React.createRef();
        this.element = React.createRef();
        this.resizeTimer = null;
        this.scrollTimer = null;
        this.fabricCanvas = new fabric.Canvas(this.canvasID, { selection: false }); 
        this.state = { visible: false };
        this.resetMenu(props);

        //On resize, force a refresh so our canvas can update its image to fit the containing div.
        window.addEventListener('resize', e => {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => this.forceUpdate(), 75)
        });
    }

    resetMenu = props => {
        this.menu = new Menu();
        this.menu.append(new MenuItem({ label: props.file.failed ? 'Mark as Failed' : 'Unmark as Failed', click() { props.setFailedState(props.folder, props.fileName) } }));
    };
    
    StyledSpinner = styled(Spinner)` && {
        position: absolute;
        right: 0.3em;
        top: 0.1em;
    }`;

    StyledNoImageIcon = styled.div` && {
        position: absolute;
        left: 0.1em;
        bottom: 0.3em;
    }`;

    StyledX = styled.i` {
        position: absolute;
        right: 0.2em;
        top: 0em;
        color: red;
    }`;

    //Central spinner for loading images
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
        if (this.hasRSML()) 
        {
            ipcRenderer.send('openViewer', folder + sep + fileName + "|" + Object.keys(file).join("|"), () => {}); //| is the delimeter for file extensions in the URL bar
        }
    };

    isVisible = active => { //Returns true if the image is currently on screen. Cannot be used before render()
        if (!active || !this.element.current) return false;
        let rect = this.element.current.getBoundingClientRect();
        return !(rect.bottom < 0 || rect.top - Math.max(document.documentElement.clientHeight, window.innerHeight) >= 0);
    };

    shouldComponentUpdate(nextProps, nextState) 
    {   
        const { folder, fileName } = nextProps;
        //There may be some merit to prevent re-renders while thumbnails are offscreen, but I'm not sure if we have any calls that cause them all to reload.
        if (this.props.active && !nextProps.active) this.setState({ visible: false }); //Reset visibility if folder is closed
        if (this.props.filterText != nextProps.filterText) 
        {
            this.setState({ visible: false });
            return false;
        }
        // if (this.props.architecture != nextProps.architecture) this.setState({ visible: false }); //Reset lazy loading for redrawing architectures <- still displays the spinner, verify later if this offers any performance gain
        if (!nextProps.active) return false; //Don't rerender if the parent folder is closed
        if (nextProps.labels != this.props.labels) return false; //If the label changes, we don't want to update with the rest of the container
        if ((JSON.stringify(this.props.inFlight) != JSON.stringify(nextProps.inFlight)) && (this.props.inFlight[folder + sep + fileName] == nextProps.inFlight[folder + sep + fileName]))
        {
            return false; //Prevent all thumbs reloading when the inflight queue changes
        }
        if ((JSON.stringify(this.props.queue) != JSON.stringify(nextProps.queue))
            && (this.props.queue.some(file => file.includes(folder + sep + fileName + ".")) == nextProps.queue.some(file => file.includes(folder + sep + fileName + "."))))
        {
            return false; //Prevent thumbs reloading when queue changes
        }
        return true; //so the label collapse animation is still smooth as the canvas won't redraw unnecessarily
    }

    componentDidUpdate(prevProps)
    {   
        if (!this.state.visible && this.isVisible(this.props.active))
            this.setState({ visible: true }) //Allow updates, but set state if the component is onscreen after a re-render -> i.e if a folder was opened, this will load the first few
        this.setupCanvas();
        this.draw();
        if (this.props.file.failed != prevProps.file.failed)
            this.resetMenu(this.props);
    }

    componentDidMount()
    {
        if (this.isVisible(this.props.active)) this.setState({ visible: true }); //This loads images that appear at boot for folders already open
        window.addEventListener('scroll', this.onScroll, true);
        this.setupCanvas();
        this.draw();    
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.onScroll);
    }

    handleRightClick = e => {
        e.preventDefault();
        if (this.props.file.parsedRSML) this.menu.popup({ window: remote.getCurrentWindow() })
    };

    onScroll = e => { 
        clearTimeout(this.scrollTimer);
        this.scrollTimer = setTimeout(() => {
            if (!this.state.visible && this.isVisible(this.props.active)) //Sets images to load if they've been scrolled onto the screen
                this.setState({ visible: true })
        }, 400); //delay should be enough to allow for multiple 'flicks' of the wheel without triggering too many renders
    };

    setupCanvas = () => {
        if (!this.container.current) {
            this.fabricCanvas.initialize(document.getElementById(this.canvasID));
        }
        this.fabricCanvas.initialize(document.getElementById(this.canvasID), { width: this.container.current.clientWidth, height: this.container.current.clientHeight });
        this.fabricCanvas.setDimensions({ width: this.container.current.clientWidth, height: this.container.current.clientHeight }, { backstoreOnly: true });
        this.fabricCanvas.defaultCursor = this.hasRSML() ? 'pointer' : 'not-allowed';
        this.fabricCanvas.hoverCursor = this.fabricCanvas.defaultCursor;
    };

    draw = () => {
        if (!this.state.visible) return false; //If the component hasn't been on screen yet, prevent the canvas from drawing.
        const { file, architecture, thumb } = this.props;
        const polylines = file.parsedRSML ? file.parsedRSML.polylines : null;
        const noImage = !Object.keys(file).find(ext => ext.match(IMAGE_EXTS_REGEX));

        let image = new Image();
        const buffer = this.getBuffer(thumb);
        if (buffer) {
            image.src = 'data:image/png;base64,' + buffer.toString('base64'); //Otherwise we can just ref the file path normally
            
            image.onload = () => {
                let im = new fabric.Image(image, {
                    left: 0, top: 0, selectable: false
                });

                im.scaleToHeight(this.container.current.clientHeight); //Scale the image towards the containing divs size. 
                im.scaleToWidth(this.container.current.clientWidth); //Perhaps not great, but I can't think of a better way. The sizing issue is circular.
                this.fabricCanvas.add(im);

                if (polylines && (noImage || architecture)) this.drawRSML(polylines, im.getObjectScaling()); //Pass the scale factor through so the RSML can calc the right offset
            };     
        } 
        else if (polylines && noImage) 
        {
            const RSMLSize = this.getRSMLSize(polylines);
            this.drawRSML(polylines, 
                { scaleX: this.container.current.clientWidth / RSMLSize.x, scaleY: this.container.current.clientHeight / RSMLSize.y },
                noImage
            );
            this.fabricCanvas.backgroundColor = "#111133"; // Make the background a blueish-grey for contrast.
        }
    };

    drawRSML = (polylines, scaling, noImage) => {
        const thumbPercentage = noImage ? 100 : THUMB_PERCENTAGE;
        polylines.forEach(line => {   //Each sub-array is a line of point objects - [ line: [{}, {} ] ]
            let polyline = new fabric.Polyline(line.points.map(point => ({ x: point.x * thumbPercentage * scaling.scaleX  / 100, y: point.y * thumbPercentage * scaling.scaleY / 100 })), {
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

    // Get the size that RSML should take up in the thumbnail, if no image.
    getRSMLSize = polylines => {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        polylines.forEach(polyline => {
            polyline.points.forEach(point => {
                if (point.x < minX) minX = point.x;
                if (point.x > maxX) maxX = point.x;
                if (point.y < minY) minY = point.y;
                if (point.y > maxY) maxY = point.y;
            });
        });
        return { x: maxX + minX, y: maxY + minY };
    };

    //Generates the API spinner with tooltip overlay, which need to be in a function component for state hooks, or nothing
    spinner = () => {
        const [show, setShow] = useState(false);
        const target = useRef(null);
        const { folder, fileName, queue, inFlight, model, apiStatus, file } = this.props;
        if (!apiStatus && !file.failed) return "";  //Disable all spinner notifications if no API connection - red model alert might still be relevant, but I don't think it's worth showing.

        let spinner, tooltipText;
        if (!model && !file.rsml)
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
        else if (file.failed) //Red X if marked as failed
        {
            spinner = <this.StyledX ref={target} id={fileName} className={"fas fa-times fa-3x"} onMouseEnter={() => setShow(!show)} onMouseLeave={() => setShow(!show)}/>;
            tooltipText = "Marked as Failed";
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
        );
    };

    noImageIcon = () => {
        const [show, setShow] = useState(false);
        const target = useRef(null);
        return (
            <>
                <Overlay target={target.current} show={show} placement="top">
                {({ placement, scheduleUpdate, arrowProps, outOfBoundaries, show: _show, ...props }) => (
                    <Tooltip placement={top} {...props}> {"This tag has no image, so only the RSML is displayed"} </Tooltip>
                )}
                </Overlay>
                <this.StyledNoImageIcon ref={target} onMouseEnter={() => setShow(!show)} onMouseLeave={() => setShow(!show)}>
                    <span className="fa-stack">
                        <i style={{color: "yellow"}} className="fas fa-image fa-stack-1x fa-inverse"></i>
                        <i style={{color: "Red"}} className="fas fa-ban fa-stack-2x"></i>
                    </span>
                </this.StyledNoImageIcon>
            </>
        );
    };
    
    FabricCanvas = () => <canvas id={this.canvasID}></canvas>;
    hasRSML      = () => "rsml" in this.props.file;
    getBuffer    = thumb => thumb ? Buffer.from(thumb) : null;

	render() {
        //folder - the full path to this folder - in state.gallery.folders
        //file - object that contains ext:bool KVs for this file - state.gallery.files[folder][fileName]
        //fileName - the full file name, no extension
        const { fileName, thumb, file } = this.props;
        // Dispose of the canvas and redraw
        if (this.fabricCanvas)
            this.fabricCanvas.dispose();

        const buffer = this.getBuffer(thumb);
        const imageSize = buffer && sizeOf(buffer);
        const baseVH = Math.round(window.innerHeight / 100);
        const heightRatio = imageSize ? imageSize.height / imageSize.width : 1.3;

        const noImage = !Object.keys(file).find(ext => ext.match(IMAGE_EXTS_REGEX));

        //The minHeight on the div is bad and should somehow change to something regarding the size of the image maybe
        return (
            <StyledImageCard style={{width: `${baseVH * 25}px`, height: `fit-content`}} clickable={this.hasRSML() ? 1 : 0} className="bg-light" onClick={e => {e.stopPropagation(); this.openViewer()}} ref={this.element} onContextMenu={this.handleRightClick}>
                <div style={{width: `${baseVH * 25}px`, height: `${heightRatio * (baseVH * 25)}px`, position: 'relative'}} ref={this.container}>
                    <this.FabricCanvas />
                    <this.spinner/>
                    {noImage ? <this.noImageIcon/> : ""}
                    {/*If there's no thumbnail and there should be (there is an image), OR the thumbnail isn't visible, render the loading spinner.*/}
                    { ((!thumb && Object.keys(file).find(ext => ext.match(IMAGE_EXTS_REGEX))) || !this.state.visible) ? <this.LoadingSpinner animation="border" variant="primary" /> : "" }
                </div>
                <CollapsableLabel file={fileName}/>
            </StyledImageCard> 
		);
	}
}
