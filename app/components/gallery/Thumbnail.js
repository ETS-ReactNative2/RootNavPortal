// @flow
import React, { Component } from 'react';
import imageThumbail from 'image-thumbnail';
import { sep } from 'path';

type Props = {};

export default class FolderView extends Component<Props> {
  props: Props;

	// shouldComponentUpdate(nextProps, nextState) 
	// {
    //     return true;
	// 	// return (JSON.stringify(nextProps.file) !== JSON.stringify(this.props.file));
	// }

	render() {
        const { folder, file, fileName } = this.props;
        console.log("Thumbnail render")
        console.log(file);
        if (file.jpg)
        {
            imageThumbail(folder + sep + file + ".jpg").then(thumb => {
                addThumb(folder, file, thumb)
            }).catch(err => console.error(err));
        }

		return (
            <>
                {
                    (file.thumb) ? <a href={file.thumb}></a> : ""
                }
            </>
		);
	}
}
