// @flow
import React, { Component } from 'react';
import RemoveButton from '../containers/gallery/RemoveButtonContainer';
import SettingsButton from '../containers/gallery/SettingsButtonContainer';
import Thumbnail from '../containers/gallery/ThumbnailContainer';
import { readdir } from 'fs';
import { StyledFolderViewDiv, StyledFolderCard, StyledRow, StyledCardHeader, StyledCardBody, StyledCardText  } from './StyledComponents'
import { StyledIcon } from '../CommonStyledComponents'
import { ALL_EXTS_REGEX, API_PARSE } from '../../constants/globals'
import { ipcRenderer } from 'electron';
import { sep } from 'path';
import { Collapse } from 'react-bootstrap';
import styled from 'styled-components';


export default class FolderView extends Component {
	shouldComponentUpdate(nextProps, nextState) 
	{
		if (nextProps.labels != this.props.labels) return true;
		if (nextProps.filterText !== this.props.filterText || nextProps.filterAnalysed !== this.props.filterAnalysed) return true;
		if (!this.props.files) return true;	//If the folder has no files, don't re-render
		return nextProps.isActive !== this.props.isActive || (JSON.stringify(nextProps.files) !== JSON.stringify(this.props.files));
	}
	
	StyledTextOverflowContainer = styled.div` && {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
	}`;
	
	render() {
		//folder - the full path to this folder - in state.gallery.folders
		//files - object of objects keyed by file name, that are in this folder only - state.gallery.files[folder]
		const { isActive, folder, filterText, filterAnalysed, files, addFiles } = this.props; 
		if (!files) {
			let structuredFiles = {};
			readdir(folder, (err, folderFiles) => {
				let matched = folderFiles.map(file => file.match(ALL_EXTS_REGEX)) //Scan for file types we use
				matched.forEach(regex => { //Structure of this array will be [original string, file name, file extension, some other stuff]
					if (regex) 
					{
						let name = regex[1]; //Each file has an object with the key as the file name
						let ext  = regex[2] ? regex[2].toLowerCase() : regex[3].toLowerCase(); //if it's a seg mask like file.first_order.png we'll get first_order, else we use the actual ext
						if (!structuredFiles[name]) structuredFiles[name] = {} // if there is rsml and the png you'll get filename: {rsml: true, png: true}
						structuredFiles[name][ext] = true; //This assumes filename stays consistent for variants of the file. They have to, else there'll be no link I guess. 2x check API behaviour on this.
					}
				});
				if (Object.keys(structuredFiles).length) 
				{
					//Evaluates all files with rsml and sends them to parse in the backend. This is so all the data is available at all times, and not on demand
					//Else exporting measurements won't have any data unless the user has looked at them all in Render, where it gets JiT parsed
					//"Parse on demand upon exporting" - we need the polylines available on gallery for the thumbnails to render RSML when that gets written
					let filesToParse = [];
					Object.keys(structuredFiles).forEach(fileName => {
						if (structuredFiles[fileName].rsml) filesToParse.push(folder + sep + fileName);
					});
					addFiles(folder, structuredFiles); //Add our struct with the folder as the key to state
					if (filesToParse.length) ipcRenderer.send(API_PARSE, filesToParse);

				}
			});		
		}
		const filesList = files ? Object.keys(files) : []; // If there are no files (files is undefined), don't try to get the keys!
		if ((!filterText || (files && filesList.some(file => file.toLowerCase().includes(filterText.toLowerCase())))) //Only display folder if there's no filterText, or any of the files includes the filter text
		&& (!filterAnalysed || (files && filesList.some(file => !!files[file].rsml)))) // AND only display folder if the analysed checkbox is off, or any of the files are analysed
		{
			return (
				<StyledFolderCard className="bg-light">
					<StyledCardHeader onClick={() => this.props.toggleOpenFile(folder)}>
						<StyledFolderViewDiv>
							<StyledIcon className={"fas fa-chevron-right fa-lg"} style={{transitionDuration: '0.5s', transform: `rotate(${isActive ? '90' : '0'}deg)`}}/>
							{folder.match(/([^\\\/]+(?:\/|\\){1}[^\\\/]+)$/)[1]}
							<div style={{marginLeft: "auto", marginRight: "0"}}>
								<SettingsButton path={folder}/>
								<RemoveButton path={folder}/>
							</div>
						</StyledFolderViewDiv>
					</StyledCardHeader>
						<Collapse in={!!(isActive && files && folder)}>
							<div>
								<StyledFolderViewDiv>
									<StyledRow> {filesList
										.filter(file => ((!filterText || file.toLowerCase().includes(filterText.toLowerCase())) && (!filterAnalysed || !!files[file].rsml))) // Remove any files that do not meet the criteria set above.
										.map((file, index) => (
											<div key={index} className="col-lg-3 col-xl-2 col-md-4 col-sm-6" style={{paddingBottom: '1em'}}>
												<Thumbnail folder={folder} fileName={file}/>
												{/* this is here as labels and thumbs have different rendering/update conditions */}
												<Collapse in={this.props.labels}> 
													<div>
														<StyledCardBody>
															<StyledCardText>
																<this.StyledTextOverflowContainer>
																	{file}
																</this.StyledTextOverflowContainer>
															</StyledCardText>
														</StyledCardBody>
													</div>
												</Collapse>
											</div>
										))} 
									</StyledRow>
								</StyledFolderViewDiv> 
							</div>
						</Collapse>
				</StyledFolderCard>
			);
		}
		else return "";
	}
}
