// @flow
import React, { Component } from 'react';
import imageThumbail from 'image-thumbnail';
import { sep } from 'path';
import { ipcRenderer } from 'electron';
import { StyledImage, StyledCardBody, StyledImageCard, StyledCardText } from './StyledComponents'

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
        if (!this.windowObject) 
        {
            const { folder, file, fileName, addThumb } = this.props;
            if (["jpg", "png"].some(ext => ext in file)) 
            {
                ipcRenderer.send('openViewer', folder + sep + fileName + "%" + Object.keys(file).filter(string => !string.includes("Thumb")).join("%"), () => {}) //% is the delimeter for file extensions in the URL bar
            }
        }
    }

	render() {
        //folder - the full path to this folder - in state.gallery.folders
        //file - object that contains ext:bool KVs for this file - state.gallery.files[folder][fileName]
        //fileName - the full file name, no extension
        const { folder, file, fileName, addThumb } = this.props;
        if (["jpg", "png", "jpeg"].some(ext => ext in file && !(ext + "Thumb" in file))) 
        {
            const ext = Object.keys(file).find(ext => ext.match(/png|jpg|jpeg/));
            
            //Tif files "don't support buffer" apparently, when thumbnailing, so uhh... :shrug:
            imageThumbail(folder + sep + fileName + "." + ext).then(thumb => 
            {
                addThumb(folder, fileName, {ext: ext, thumb}) //Bundle the thumbnail with the extension so we can label them pngThumb or similar accordingly in case there are multiple thumbs for a file name
            }).catch(err => console.error(err));
        }

        let image;
        Object.keys(file).forEach(key => {
            if (key.includes("Thumb"))
            {
                let source = 'data:image/'+key.substring(0.3)+';base64,' + btoa(String.fromCharCode.apply(null, file[key]));
                image = <StyledImage className="card-img-top" src={ source }/> 
            }
        })

        return (
            <StyledImageCard className="bg-light" onClick={e => e.stopPropagation()} onDoubleClick={this.openViewer}>
                <div>{image}</div>
                <StyledCardBody>
                    <StyledCardText>
                        {fileName}
                    </StyledCardText>
                </StyledCardBody>
            </StyledImageCard>            
		);
	}
}
