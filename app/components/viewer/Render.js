// @flow
import React, { Component } from 'react';

type Props = {};

export default class Render extends Component<Props> {
    props: Props;
    componentDidMount()
    {
        let parsedRSML;
        console.log("constructor");
        console.log(this.props)
        const canvas = this.refs.canvas;
        const ctx = canvas.getContext("2d");
        const tolerance = 0.1;
        const highQuality = false;
        
        ctx.strokeStyle = '#f53';
        ctx.lineWidth = 2;
        ctx.lineCap = ctx.lineJoin ='round';
        if (parsedRSML)
        {
            //parse the read RSML into an array of points, or several arrays of points, I guess lines for each primary and lateral else our line will be doing huge paths back and forth and fuck the metrics
            //simplify points

            /*
            rsml:
                scene:
                    plant:
                        root: []
                            0: {}
                                attr: @_label: primary
                                geometry:
                                    polyline: {}
                                        point: [{ attr: {@_x: 123, @_y: 456}, {attr: @_x: 123, @_y: 456} }]
                                    rootnavspline: I don't think we need splines
                                        point: [{}]
                                root: 
                                    0: {}
                                        attr: @_label "lat"
                                        geometry: 
                                            spline/polyline:
                            1:
                            2:
                    plant:
                    plant:
            */
        }
    }

    render() 
    {
        console.log(this.props);
        return (
            <div>
                <canvas ref="canvas"/>
            </div>
        );
    }
}
