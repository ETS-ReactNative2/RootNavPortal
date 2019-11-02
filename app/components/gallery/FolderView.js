// @flow
import React, { Component } from 'react';
import RemoveButton from '../containers/RemoveButtonContainer';
import Thumbnail from '../containers/ThumbnailContainer';
import { readdir } from 'fs';
import styled from 'styled-components';

type Props = {};

export default class FolderView extends Component<Props> {
	props: Props;

	constructor(props) {
		console.log("Props")
		super(props);
		const { folder, files, eventKey, isActive } = props; 
		let structuredFiles = {};
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
			console.log(Object.keys(structuredFiles));
			if (Object.keys(structuredFiles).length) 
			{
				this.props.addFiles(folder, structuredFiles); //Add our struct with the folder as the key to state
			}
		});		
	}	

	shouldComponentUpdate(nextProps, nextState) 
	{
		console.log(nextProps, nextState, this.props);
		if (!this.props.files) return true;
		return Object.keys(nextProps.files).length != Object.keys(this.props.files).length; 
	}

	renderActive(StyledFolderView, StyledHR) {
		const { folder, files, eventKey, isActive } = this.props; 
		console.log("BBBB");
		return (
			<div>
				<StyledFolderView>
					<i className="fas fa-chevron-down" /> 
					<i className="fas fa-folder-open"/> 
					Hello from {folder}!
					<RemoveButton path={folder}/>
					<br />
					{
						(files && folder) ? Object.keys(files).map(file => {
								console.log(file);
								return <Thumbnail folder={folder} file={file}/>
							}) : ""
					}
				</StyledFolderView>
				<StyledHR/>
			</div>
			);
	}

	renderInactive(StyledFolderView, StyledHR) {
		const { folder, files, eventKey, isActive } = this.props; 
		console.log("AAAA");
		return (
			<div>
				<StyledFolderView>
					<i className="fas fa-chevron-right" /> 
					<i className="fas fa-folder"/> 
					Hello from {folder}!
					<RemoveButton path={folder}/>
					<br />
				</StyledFolderView>
				<StyledHR/>
			</div>
			);
		}

	render() {
		//folder - the full path to this folder - in state.gallery.folders
		//files - object of objects keyed by file name, that are in this folder only - state.gallery.files[folder]
		const { isActive } = this.props; 

		const StyledFolderView = styled.div` && {
			height: 3em;
			display: -ms-flexbox;
			display: -webkit-flex;
			display: flex;
			-ms-flex-align: center;
			-webkit-align-items: center;
			-webkit-box-align: center;
			align-items: center;
			margin: 1em 4.5em;
		}`;

		const StyledHR = styled.hr` && {
      border: 1.2px solid black;
			border-radius: 1em;
			margin: 0 4em;
    }`;
	console.log(this.props);


		if (isActive) return this.renderActive(StyledFolderView, StyledHR);
		return this.renderInactive(StyledFolderView, StyledHR);
	}
}
