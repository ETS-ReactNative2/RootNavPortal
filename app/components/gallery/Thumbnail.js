// @flow
import React, { Component } from 'react';
import imageThumbail from 'image-thumbnail';
import { sep } from 'path';
import { ipcRenderer } from 'electron';
import { StyledImage, StyledCol, StyledRow } from './StyledComponents'
import { Row, Col } from 'react-bootstrap';

type Props = {};

export default class Thumbnail extends Component<Props> {
  props: Props;
    windowObject = null;

	shouldComponentUpdate(nextProps, nextState) 
	{
		return (JSON.stringify(nextProps.file) !== JSON.stringify(this.props.file));
	}

    openViewer = e => 
    {
        console.log(`file://${__dirname}/app.html?gallery`)
        if (!this.windowObject) 
        {
            const { folder, file, fileName, addThumb } = this.props;
            if (["jpg", "png"].some(ext => ext in file)) 
            {
                ipcRenderer.send('openViewer', folder + sep + fileName + "%" + Object.keys(file).filter(string => !string.includes("Thumb")).join("%"), () => { //% is the delimeter for file extensions in the URL bar
                    console.log("Sent open viewer");
                })
            }
        }
    }

	render() {
        //folder - the full path to this folder - in state.gallery.folders
        //file - object that contains ext:bool KVs for this file - state.gallery.files[folder][fileName]
        //fileName - the full file name, no extension
        const { folder, file, fileName, addThumb } = this.props;
        if (["jpg", "png"].some(ext => ext in file && !(ext + "Thumb" in file))) 
        {
            const ext = 'jpg' in file ? 'jpg' : 'png';

            imageThumbail(folder + sep + fileName + "." + ext).then(thumb => 
            {
                addThumb(folder, fileName, {ext: ext, thumb}) //Bundle the thumbnail with the extension so we can label them pngThumb or similar accordingly in case there are multiple thumbs for a file name
            }).catch(err => console.error(err));
        }

		return (
            <div>
                <Row><Col>
                {
                    (file.pngThumb) ? <StyledImage className="rounded mx-auto d-block" src={'data:image/png;base64,' + btoa(String.fromCharCode.apply(null, file.pngThumb)) } onClick={e => e.stopPropagation()} onDoubleClick={this.openViewer}/> :
                    (file.jpgThumb) ? <StyledImage className="rounded mx-auto d-block" src={'data:image/jpg;base64,' + btoa(String.fromCharCode.apply(null, file.jpgThumb)) } onClick={e => e.stopPropagation()} onDoubleClick={this.openViewer}/> : 
                    ""
                }
                </Col></Row>
                <StyledRow><StyledCol>{fileName}</StyledCol></StyledRow>
            </div>
            
		);
	}
}
