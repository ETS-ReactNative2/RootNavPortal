// @flow
import React, { Component } from 'react';
import { readFileSync } from 'fs';
import parser from 'xml2json';
import { sep } from 'path';
import { IMAGE_EXTS_REGEX, matchPathName, xmlOptions } from '../../constants/globals'
import imageThumb from 'image-thumbnail';
import Tiff from 'tiff.js';
import { fabric } from 'fabric'; //Fabric will give you node-gyp build errors, but it's fine, because we're actually a browser. :electrongottem:
import sizeOf from 'image-size';

export default class Render extends Component {
    constructor(props)
    {
        super(props);
        this.canvasID = [...Array(5)].map(() => Math.random().toString(36)[2]).join(''); //Make a random canvas ID so we can open multiple and recreating isn't a problem
    }
    
    //Objects are named by their RSML ID => laterals are parentID.latID
    getObjectByName = name => {    
        let objects = this.fabricCanvas.getObjects();
        for (let i = 0; i < this.fabricCanvas.size(); i++)
            if (objects[i].name && objects[i].name == name)
                return objects[i];
    };

    colours = { PRIMARY: '#f53', LATERAL: '#ffff00', HOVERED: 'white' };
    rsmlPoints = [];
    fabricCache = {
        selectedID: null,
    };
    deleteKey = "Backspace";

    //Fires on each component update - not initial render - which is fine since our ref for drawing won't be active in render, and the state change from reading RSML will trigger an update
    componentDidUpdate()
    {
        this.setupCanvas();
        this.draw();
    }

    componentWillUnmount()
    {
        document.removeEventListener("keydown", this.handleDelete, false);
    }

    componentDidMount()
    {
        document.addEventListener("keydown", this.handleDelete, false);
        this.setupCanvas();
        this.draw();    
    }

    setupCanvas = () => {
        this.fabricCanvas.initialize(document.getElementById(this.canvasID), { width: 1000, height: 1000 }); //This is the element size, these may need tweaking, maybe on the fly later
        this.fabricCanvas.setDimensions({ width: 3000, height: 3000 }, { backstoreOnly: true }); //These really need evening. They both change the canvas.
        //setDimensions changes the drawing space WITHIN the element's space, sort of like scaling within the given box. Wheat images are really tall.
        //Arabidopsis are square, and not that big. So we have images with like 1000px of difference in height. Some thinking needs doing here.
        
        this.fabricCanvas.on('mouse:over', e => {
            if (e.target && e.target.selectable && e.target.get('name') != this.fabricCache.selectedID) 
            {
                e.target.set('stroke', this.colours.HOVERED);
                this.fabricCanvas.renderAll();
            }
        });

        this.fabricCanvas.on('mouse:out', e => {
            if (e.target && e.target.selectable && this.fabricCache.selectedID != e.target.get('name'))
            {
                e.target.set('stroke', e.target.get('name').toString().includes(".") ? this.colours.LATERAL : this.colours.PRIMARY);
                this.fabricCanvas.renderAll();
            }
        });

        this.fabricCanvas.on('mouse:down', e => {
            if (e.target && this.fabricCache.selectedID) 
            {
                let line = this.getObjectByName(this.fabricCache.selectedID)
                line.set('stroke', line.get('name').toString().includes(".") ? this.colours.LATERAL : this.colours.PRIMARY);
                this.fabricCache.selectedID = null;
                this.fabricCanvas.renderAll();
            }
            if (e.target && e.target.selectable) 
            {
                e.target.set('stroke', this.colours.HOVERED);
                this.fabricCache.selectedID = e.target.name;
                this.fabricCanvas.renderAll();
            }
        });
    };

    getLaterals = primaryID => {
        let laterals = [];
        
        this.fabricCanvas.getObjects().forEach(object => {
            if (object.name && object.name.startsWith(primaryID + '.'))
                laterals.push(object);
        });
        return laterals;
    };

    handleDelete = e =>
    {
        if (e.key != this.deleteKey) return;
        const { editStack, pushEditStack, file: { parsedRSML }} = this.props;
        const { selectedID } = this.fabricCache;
        if (selectedID)
        {
            this.fabricCanvas.remove(this.getObjectByName(selectedID));

            if (!selectedID.includes('.'))
                this.getLaterals(selectedID).forEach(lateral => {
                    this.fabricCanvas.remove(lateral);
                });
            
            const simplifiedLines = editStack.length ? editStack[editStack.length - 1] : parsedRSML.simplifiedLines;
            let editedLines = simplifiedLines.filter(line => {
                if (selectedID.includes('.')) return selectedID != line.id;
                else return !line.id.startsWith(selectedID + '.') && line.id != selectedID;
            });

            pushEditStack(editedLines);
            this.fabricCache.selectedID = null;
            //We need a save changes button, which will write it back to simplifiedLines[id], send to Redux, and reconstruct RSML
        }
    };

    draw = () => {
        const { file, path, architecture, segMasks, updateFile, editStack } = this.props;
        
        if (file.parsedRSML) //Ready to draw!
        {
            //If there's something on the edit stack, grab the last one, else we use the file state RSML
            const simplifiedLines = editStack.length ? editStack[editStack.length - 1] : file.parsedRSML.simplifiedLines;
            if (!simplifiedLines) return;

            let image = new Image();
            let matchedPath = matchPathName(path);

            const ext = Object.keys(file).find(ext => ext.match(IMAGE_EXTS_REGEX));
            if (segMasks && file.first_order && file.second_order) //Composite the segmasks together
                if (!file.seg_mask) 
                    imageThumb.sharpBlend(matchedPath[1] + sep + matchedPath[2] + ".first_order.png", matchedPath[1] + sep + matchedPath[2] + ".second_order.png", 'add') //https://libvips.github.io/libvips/API/current/libvips-conversion.html#VipsBlendMode
                        .then(output => {
                            updateFile(matchedPath[1], matchedPath[2], { seg_mask: output} ); //Cache the segmask in Redux so we don't composite every time
                            image.src = 'data:image/png;base64,' + output.toString('base64');
                        });
                else image.src = 'data:image/png;base64,' + file.seg_mask.toString('base64');
            
            else if (ext.includes('tif')) //Decode and render tiff to a canvas, which we draw to our main canvas
            {
                sizeOf(matchedPath[1] + sep + matchedPath[2] + "." + ext, (err, dimensions) => { //Get size of tiff
                    let canvas = new OffscreenCanvas(dimensions.width, dimensions.height); //Create offscreen canvas with its resolution
                    let image = new Tiff({ buffer: readFileSync(matchedPath[1] + sep + matchedPath[2] + "." + ext) }); //convert tiff
                    canvas.getContext("2d").drawImage(image.toCanvas(), 0, 0); //Draw to offscreen canvas which is then copied to fabric
                    this.fabricCanvas.add(new fabric.Image(canvas, { //The 1024x1024 tiff renders really small, as does the RSML. Hmm.
                        left: 0, top: 0, selectable: false
                    }));
                    if (architecture) this.drawRSML(simplifiedLines); 
                });
                
            }
            else image.src = matchedPath[1] + sep + matchedPath[2] + "." + ext; //Otherwise we can just ref the file path normally

            image.onload = () => {
                this.fabricCanvas.add(new fabric.Image(image, {
                    left: 0, top: 0, selectable: false
                }));
                if (architecture) this.drawRSML(simplifiedLines); //This needs to be called after each image draws, otherwise the loading may just draw it over the rsml due to async 
            };     
        }
    };

    drawRSML = (simplifiedLines) => {
        simplifiedLines.forEach(line => {   //Each sub-array is a line of point objects - [ line: [{}, {} ] ]
            let polyline = new fabric.Polyline(line.points, {
                stroke: line.type == 'primary' ? this.colours.PRIMARY : this.colours.LATERAL,
                fill: null,
                strokeWidth: 8,
                perPixelTargetFind: true,
                name: line.id
            });
            this.fabricCanvas.add(polyline);
        });
    };

    //Formats a plant into arrays of lines - all the polylines in the RSML, labelled by primary/lateral
    formatPoints = (rsml, plantID) => {
        if (rsml.geometry) //If the node has geometry, extract it into an array of simplified points
        {
            // simplifiedLines: [ {type: "lat", id: "5.3", points: [{x, y}] }]
            this.rsmlPoints.push({ //To test alts, change rootnavspline to polyline
                type: rsml.label,
                id: plantID + "-" + rsml.id, //This structure may not be useful for plugins, so they might need to do organising of RSML themselves
                points: rsml.geometry[0].polyline[0].point.map(p => ({ 
                    x: parseFloat(p.x), //Floats still need to be transformed so Fabric can draw them right => but only in the line array, these never end up in the RSML/JSON
                    y: parseFloat(p.y)
                })) //Can also add a * 0.5 to scale the image points down, rather than scaling the canvas
            });
        }
        if (rsml.root)
        {
           rsml.root.forEach(root => this.formatPoints(root, plantID));
        }
    };

    FabricCanvas = () => {
        this.fabricCanvas = new fabric.Canvas(this.canvasID);
        return <canvas id={this.canvasID}></canvas>;
    };

    render() 
    {   
        if (this.fabricCanvas) this.fabricCanvas.dispose();
        const { file, path, updateParsedRSML } = this.props;

        if (!file.parsedRSML && file.rsml)
        {
            let matchedPath = matchPathName(path);
            //Ingest the RSML here if it's not cached in state
            let rsmlJson = parser.toJson(readFileSync(matchedPath[1] + sep + matchedPath[2] + ".rsml", 'utf8'), xmlOptions);

            let plant = rsmlJson.rsml[0].scene[0].plant; 
            plant.forEach(plantItem => this.formatPoints(plantItem, plantItem.id));
            updateParsedRSML(matchedPath[1], matchedPath[2], { rsmlJson, simplifiedLines: this.rsmlPoints }); //Send it to state, with {JSONParsedXML, and simplifiedPoints}
            this.rsmlPoints = [];
        }

        return (
            <div>
                <this.FabricCanvas />
            </div>
        );
    }
}


/*
Example of parsedJSON from XML. Everything is coerced into an array, so for all files, getting to the plants will be var.rsml[0].scene[0].plant[....]

parsedJson: {}
    rsml: [{}]
        0: {
            metadata: [{}]
            scene: [{}]
                0:  plant: [{}]
                        0: {
                                attr: {} @_label: primary, @_id: 1
                                geometry: [{}]
                                    0: {
                                        polyline: [{}]
                                            0: {
                                                point: [{ attr: {@_x: 123, @_y: 456}, {attr: @_x: 123, @_y: 456} }]
                                            }
                                        rootnavspline: I don't think we need splines
                                        point: [{}]
                                    }
                                root: {[]}
                                    0: {}
                                        attr: @_label "lat"
                                        geometry: [{}]
                                            spline/polyline:
                        }
                        1: {

                        }
                
        }
*/