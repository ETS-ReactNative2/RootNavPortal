// @flow
import React, { Component } from 'react';
import RemoveButton from '../containers/RemoveButtonContainer';
import Thumbnail from '../containers/ThumbnailContainer';
import { Accordion, Card } from 'react-bootstrap';
import { readdir } from 'fs';

type Props = {};

export default class FolderView extends Component<Props> {
  props: Props;

	shouldComponentUpdate(nextProps, nextState) 
	{
		// return true;
		// return Object.keys(nextProps.files).length != Object.keys(this.props.files).length;
		return (JSON.stringify(nextProps.files[this.props.folder]) !== JSON.stringify(this.props.files[this.props.folder]));
	}

	render() {
		const { folder, files, eventKey, folders } = this.props;
		console.log(folder, folders)
		let structuredFiles = {};

		readdir(folder, (err, files) => {
			console.log("Reading fs");
			let matched = files.map(file => file.match(/(.+)\.(rsml|txt|png|jpg|jpeg)$/)) //Scan for file types we use
			matched.forEach(regex => { 
				if (regex) 
				{
					let name = regex[1]; //Each file has an object with the key as the file name
					let ext = regex[2]; //that key's value is an object that holds the extensions we found as bools
					if (!structuredFiles[name]) structuredFiles[name] = {} // if there is rsml and the png you'll get filename: {rsml: true, png: true}

					structuredFiles[name][ext] = true; //This assumes filename stays consistent for variants of the file. They have to, else there'll be no link I guess. 2x check API behaviour on this.
				}
			});
			if (Object.keys(structuredFiles).length) 
			{
				this.props.addFiles(folder, structuredFiles); //Add our struct with the folder as the key to state
			}
		});
		
		// if (files) Object.keys(files[folder]).forEach(file => {
		// 	return console.log(file)
		// })		

		return (
		<Card>
			<Accordion.Toggle as={Card.Header} eventKey={eventKey}>
				Hello from {folder}!
				<RemoveButton path={folder}/>
			</Accordion.Toggle>
			<Accordion.Collapse eventKey={eventKey}>
				<Card.Body>
					Hello! I'm the body
					{
						(files && folder && files[folder]) ? Object.keys(files[folder]).map(file => {
							console.log(file);
							return <Thumbnail folder={folder} file={file}/>
						}) : ""
					}
				</Card.Body>
			</Accordion.Collapse>
		</Card>
		);
	}
}
