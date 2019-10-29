// @flow
import React, { Component } from 'react';
import RemoveButton from '../containers/RemoveButtonContainer';
import Thumbnail from '../containers/ThumbnailContainer';
import { readdir } from 'fs';
import styled from 'styled-components';

type Props = {};

export default class FolderView extends Component<Props> {
	props: Props;

	shouldComponentUpdate(nextProps, nextState) 
	{
		// return true;
		console.log(nextProps, nextState, this.props);
		if (!this.props.files) return true;
		return Object.keys(nextProps.files).length != Object.keys(this.props.files).length; 
		// return (JSON.stringify(nextProps.files[this.props.folder]) !== JSON.stringify(this.props.files[this.props.folder]));
	}

	render() {
		//folder - the full path to this folder - in state.gallery.folders
		//files - object of objects keyed by file name, that are in this folder only - state.gallery.files[folder]
		const { folder, files, eventKey} = this.props; 
		let structuredFiles = {};

		const StyledFolderView = styled.div` && {
			height: 4em;
			border: solid 2px;
			border-color: black;
			display: -ms-flexbox;
			display: -webkit-flex;
			display: flex;
			-ms-flex-align: center;
			-webkit-align-items: center;
			-webkit-box-align: center;
			align-items: center;
			border-radius: 1em;
			margin: 1em;
			padding-left: 2em;
		}`;

		readdir(folder, (err, files) => {
			let matched = files.map(file => file.match(/(.+)\.(rsml|txt|png|jpg|jpeg)$/)) //Scan for file types we use
			matched.forEach(regex => { //Structure of this array will be [original string, file name, file extension, some other stuff]
				if (regex) 
				{
					let name = regex[1]; //Each file has an object with the key as the file name
					let ext = regex[2];  //that key's value is an object that holds the extensions we found as bools
					if (!structuredFiles[name]) structuredFiles[name] = {} // if there is rsml and the png you'll get filename: {rsml: true, png: true}

					structuredFiles[name][ext] = true; //This assumes filename stays consistent for variants of the file. They have to, else there'll be no link I guess. 2x check API behaviour on this.
				}
			});
			if (Object.keys(structuredFiles).length) 
			{
				this.props.addFiles(folder, structuredFiles); //Add our struct with the folder as the key to state
			}
		});	

		return (
		<StyledFolderView>
				Hello from {folder}!
				<RemoveButton path={folder}/>
		</StyledFolderView>
		);
	}
}
