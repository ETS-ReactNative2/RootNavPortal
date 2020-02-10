// @flow
import React, { Component } from 'react';
import { readFileSync } from 'fs';
import parser from 'fast-xml-parser';
import { sep } from 'path';
import { IMAGE_EXTS_REGEX, matchPathName } from '../../constants/globals'
import imageThumb from 'image-thumbnail';
type Props = {};

export default class Render extends Component<Props> {
    constructor(props)
    {
        super(props);
        this.canvas = React.createRef();
    }

    colours = {PRIMARY: '#f53', LATERAL: '#ffff00'};
    rsmlPoints = [];
    canvasScaleDiv = 2; //Canvas scale is 1 / this. Used to clear the canvas with inverted scaling

    xmlOptions = {
        attributeNamePrefix: "@_",
        attrNodeName: "attr", //default is 'false'
        textNodeName: "#text",
        ignoreAttributes: false,
        ignoreNameSpace: false,
        allowBooleanAttributes: false,
        parseNodeValue: true,
        parseAttributeValue: true,
        trimValues: true,
        decodeHTMLchar: true,
        cdataTagName: "__cdata", //default is 'false'
        cdataPositionChar: "\c"
    };

    //Fires on each component update - not initial render - which is fine since our ref for drawing won't be active in render, and the state change from reading RSML will trigger an update
    componentDidUpdate()
    {
        this.draw();
    }

    draw = () => {
        const { file, path, architecture, segMasks } = this.props;
        const ctx    = this.canvas.current.getContext("2d");
        const canvas = this.canvas.current;
        ctx.clearRect(0, 0, canvas.width * this.canvasScaleDiv , canvas.height * this.canvasScaleDiv); //Multiply dimensions by the inverse of the scale to clear the whole thing properly

        if (file.parsedRSML) //Ready to draw!
        {
            const { simplifiedLines } = file.parsedRSML;
            if (!simplifiedLines) return;

            let image = new Image();
            let matchedPath = matchPathName(path);

            const ext = Object.keys(file).find(ext => ext.match(IMAGE_EXTS_REGEX));
            if (segMasks && file.first_order && file.second_order) 
                imageThumb.sharpBlend(matchedPath[1] + sep + matchedPath[2] + ".first_order.png", matchedPath[1] + sep + matchedPath[2] + ".second_order.png", 'add') //https://libvips.github.io/libvips/API/current/libvips-conversion.html#VipsBlendMode
                    .then(output => image.src = 'data:image/png;base64,' + btoa(String.fromCharCode.apply(null, output)));
            else image.src = matchedPath[1] + sep + matchedPath[2] + "." + ext;
        
            image.onload = () => {
                ctx.drawImage(image, 0, 0);
                
                if (architecture)
                {
                    simplifiedLines.forEach(line => {   //Each sub-array is a line of point objects - [ line: [{}, {} ] ]
                        ctx.strokeStyle = line.type == 'primary' ? this.colours.PRIMARY : this.colours.LATERAL; //This means lines are only drawn if there's an image along with the RSML
                        ctx.beginPath(); //Draw the actual line
                        line.points.forEach(point => {
                            ctx.lineTo(point.x, point.y);
                        });
                        ctx.stroke();
                    })
                }
            };            
        }
    }

    componentDidMount()
    {
        const canvas = this.canvas.current;
        const ctx = canvas.getContext("2d");
        canvas.width  = "1200";  //defaults to 300x150
        canvas.height = "1200"; //We'll need to upscale the DOM DPI, and then scale it down to fit the UI to get a high res canvas
        
        //Canvas settings
        ctx.strokeStyle = '#f53';
        ctx.lineWidth   = 4;
        ctx.lineCap     = ctx.lineJoin ='round';

        ctx.scale(1 / this.canvasScaleDiv, 1 / this.canvasScaleDiv);
        this.draw();    
    }

    //Formats a plant into arrays of lines - all the polylines in the RSML, labelled by primary/lateral
    formatPoints = rsml => {
        const { attrNodeName, attributeNamePrefix } = this.xmlOptions;
        if (rsml.geometry) //If the node has geometry, extract it into an array of simplified points
        {
            // simplifiedLines: [ {type: "lat", points: [{x, y}] }]
            this.rsmlPoints.push(   //To test alts, change rootnavspline to polyline
                { type: rsml[attrNodeName][attributeNamePrefix + 'label'], //This structure may not be useful for plugins, so they might need to do organising of RSML themselves
                points: rsml.geometry.rootnavspline.point.map(p => ({ 
                    x: p.attr[attributeNamePrefix + 'x'],             
                    y: p.attr[attributeNamePrefix + 'y']
                })) //Can also add a * 0.5 to scale the image points down, rather than scaling the canvas
            });
        }
        if (rsml.root)
        {
           Array.isArray(rsml.root) ? rsml.root.forEach(root => this.formatPoints(root)) : this.formatPoints(rsml.root); //XMl parsing results in this check being required here too
        }
    }

    render() 
    {   
        const { file, path, updateParsedRSML } = this.props;
        if (!file.parsedRSML && file.rsml)
        {
            let matchedPath = matchPathName(path);
            //Ingest the RSML here if it's not cached in state
            let data = readFileSync(matchedPath[1] + sep + matchedPath[2] + ".rsml", 'utf8');
            let rsmlJson = parser.parse(data, this.xmlOptions);
            const { scene: { plant } } = rsmlJson.rsml;
            //if the XML tag contains a single root/plant, it's an object, if it has multiple, it'll be an array of [0: {}, 1: {}, 2: {}, ...], hence the need for this check
            Array.isArray(plant) ? plant.forEach(plantItem => this.formatPoints(plantItem)) : this.formatPoints(plant);
            updateParsedRSML(matchedPath[1], matchedPath[2], {rsmlJson, simplifiedLines: this.rsmlPoints}); //Send it to state, with {JSONParsedXML, and simplifiedPoints}
            this.rsmlPoints = [];
        }

        return (
            <div>
                <canvas ref={this.canvas} />
            </div>
        );
    }
}

//parse the read RSML into an array of points, or several arrays of points, I guess lines for each primary and lateral else our line will be doing huge paths back and forth and fuck the metrics
            //simplify points

            /*
            rsml:
                scene: {}
                    plant: {}
                        root: []
                            0: {}
                                attr: {} @_label: primary
                                geometry: {}
                                    polyline: {}
                                        point: [{ attr: {@_x: 123, @_y: 456}, {attr: @_x: 123, @_y: 456} }]
                                    rootnavspline: I don't think we need splines
                                        point: [{}]
                                root: []
                                    0: {}
                                        attr: @_label "lat"
                                        geometry: {}
                                            spline/polyline:
                            1:
                            2:
                    plant:
                    plant:
            */