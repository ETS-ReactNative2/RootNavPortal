// @flow
import React, { Component } from 'react';
import { readFile } from 'fs';
import parser from 'fast-xml-parser';
import { sep } from 'path';
import simplify from 'simplify-js';
type Props = {};

export default class Render extends Component<Props> {
    props: Props;

    colours = {PRIMARY: '#f53', LATERAL: '#ffff00'};
    rsmlPoints = [];

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

    componentDidMount()
    {
        const { file, path, updateParsedRSML } = this.props;

        console.log("constructor");
        console.log(this.props)
        const canvas = this.refs.canvas;
        const ctx = canvas.getContext("2d");
        canvas.width = "2000";  //defaults to 300x150
        canvas.height = "2000"; //We'll need to upscale the DOM DPI, and then scale it down to fit the UI to get a high res canvas

        ctx.clearRect(0, 0, 1600, 1600);
        ctx.strokeStyle = '#f53';
        ctx.lineWidth  = 2;
        ctx.lineCap    = ctx.lineJoin ='round';
        ctx.beginPath();
        ctx.rect(10, 10, 50, 50);
        ctx.stroke();
        ctx.beginPath();
        ctx.lineTo(0, 0)
        ctx.lineTo(10, 10)
        ctx.lineTo(20, 20)
        ctx.lineTo(100, 100)
        ctx.lineTo(140, 140)

        ctx.stroke();
        // ctx.translate(-100, -100);
        ctx.scale(0.7, 0.7)

        let r = path.match(/(.+\\|\/)(.+)/); //Matches the file path into the absolute directory path and file name
        r[1] = r[1].slice(0, -1);

        if (!file.parsedRSML && file.rsml)
        {
            //Ingest the RSML here if it's not cached in state
            readFile(r[1] + sep + r[2] + ".rsml", 'utf8', (err, data) => {
                let rsmlJson = parser.parse(data, this.xmlOptions);
                const { scene } = rsmlJson.rsml;
                //if the XML tag contains a single root/plant, it's an object, if it has multiple, it'll be an array of [0: {}, 1: {}, 2: {}, ...], hence the need for this check
                Array.isArray(scene) ? scene.forEach(plant => this.formatPoints(plant)) : Object.keys(scene).forEach(plant => this.formatPoints(scene[plant]));
                updateParsedRSML(r[1], r[2], {rsmlJson, simplifiedLines: this.rsmlPoints}); //Send it to state, with {JSONParsedXML, and simplifiedPoints}
            });
        }

        if (file.parsedRSML) //Ready to draw!
        {
            const { simplifiedLines } = file.parsedRSML;
            console.log("Drawing")
            console.log(file);
            if (!simplifiedLines) return;
            simplifiedLines.forEach(line => {   //Each sub-array is a line of point objects - [ line: [{}, {} ] ]
                ctx.strokeStyle = line.type == 'primary' ? this.colours.PRIMARY : this.colours.LATERAL; 

                //Draws a line
                ctx.beginPath();
                line.points.forEach(point => {
                    ctx.lineTo(point.x, point.y);
                })
                ctx.stroke();
            })
        }
    }

    //Formats a plant into arrays of lines - all the polylines in the RSML, labelled by primary/lateral
    formatPoints = rsml => {
        const tolerance   = 0.1;
        const highQuality = true;
        const { attrNodeName, attributeNamePrefix } = this.xmlOptions;
        if (rsml.geometry) //If the node has geometry, extract it into an array of simplified points
        {
            // simplifiedLines: [ {type: "lat", points: [{x, y}] }]
            
            this.rsmlPoints.push(
                { type: rsml[attrNodeName][attributeNamePrefix + 'label'], 
                points: simplify(rsml.geometry.polyline.point.map(p => ({ //Maybe we should just extract Mike's splines instead and use them, I think this does nearly the same. Should compare results.
                    x: p.attr[attributeNamePrefix + 'x'],
                    y: p.attr[attributeNamePrefix + 'y'] 
                })), tolerance, highQuality)
            });
        }
        if (rsml.root)
        {
           Array.isArray(rsml.root) ? rsml.root.forEach(root => this.formatPoints(root)) //XMl parsing results in this check being required here too
            : Object.keys(rsml.root).forEach(root => this.formatPoints(rsml.root[root]));
        }
    }
    render() 
    {
        return (
            <div>
                <canvas ref="canvas" />
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