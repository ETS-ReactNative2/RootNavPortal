// @flow
import React, { Component, useState, useRef, createRef } from 'react';
import RemoveButton from '../containers/gallery/RemoveButtonContainer';
import SettingsButton from '../containers/gallery/SettingsButtonContainer';
import Thumbnail from '../containers/gallery/ThumbnailContainer';
import TextPopup from '../common/TextPopup';
import { readdir } from 'fs';
import { StyledFolderViewDiv, StyledFolderCard, StyledRow, StyledCardHeader } from './StyledComponents'
import { StyledIcon } from '../CommonStyledComponents'
import { ALL_EXTS_REGEX, API_PARSE, IMAGE_EXTS, _require, sendThumbs } from '../../constants/globals'
import { ipcRenderer } from 'electron';
import { sep } from 'path';
import { Collapse, Overlay, Tooltip, Spinner } from 'react-bootstrap';
import styled from 'styled-components';

export default class FolderView extends Component {
	constructor(props)
	{
		super(props);
		this.state = { read: false, thumbsGenerating: false };
	}

	StyledSpinner = styled(Spinner)` && {
		margin-left: auto;
		margin-right: 0.7em;
	}`;

	StyledGridXXL = styled.div` && { 
		@media (min-width: 1400px) {
			-ms-flex: 0 0 16.666667%;
			flex: 0 0 16.666667%;
			max-width: 16.666667%;
	}}`;
	
	shouldComponentUpdate(nextProps, nextState) 
	{
		if (this.state.thumbsGenerating != nextState.thumbsGenerating) return true;
		if (nextProps.labels != this.props.labels) return true;
		if ((nextProps.filterText !== this.props.filterText) || (nextProps.filterAnalysed !== this.props.filterAnalysed)) return true;
		if (!this.props.files) return true;	//If the folder has no files, don't re-render
		return (nextProps.isActive !== this.props.isActive) || (JSON.stringify(nextProps.files) !== JSON.stringify(this.props.files));
	}

	componentDidUpdate()
	{
		this.checkThumbs();
	}

	checkThumbs()
	{
		const { files, thumbs, isActive } = this.props; 
		if (isActive && !thumbs && files && !this.state.thumbsGenerating)
		{
			this.generateThumbs(files, Object.keys(files))
		}
	};

	spinner = () => {
        const [show, setShow] = useState(false);
		const target = useRef(null);

        let spinner, tooltipText;
        if (this.state.thumbsGenerating)
        {
            spinner = <this.StyledSpinner ref={target} animation="border" variant="primary" onMouseEnter={() => setShow(!show)} onMouseLeave={() => setShow(!show)}/>;
            tooltipText = "Processing thumbnails";
        }

        return (
            <>
                <Overlay target={target.current} show={show} placement="top">
                {({ placement, scheduleUpdate, arrowProps, outOfBoundaries, show: _show, ...props }) => (
                    <Tooltip placement={top} {...props}> {tooltipText} </Tooltip>
                )}
                </Overlay>
                {spinner}
            </>
        )
	};
	
	generateThumbs = (structuredFiles, fileKeys) => {
		const { folder, addThumbs } = this.props; 
		let thumbFiles = fileKeys.map(fileName => {
			if (IMAGE_EXTS.some(ext => ext in structuredFiles[fileName])) 
			{
				const { parsedRSML, _C1, _C2, rsml, ...exts } = structuredFiles[fileName];
				return { folder, file: exts, fileName };
			}
		}).filter(item => item !== undefined);

		if (thumbFiles.length)
		{
			this.setState({ thumbsGenerating: true });
			sendThumbs(thumbFiles, addThumbs).then(() => this.setState({ thumbsGenerating: false }));
		}
	};

	componentDidMount()
	{
		const { folder, files, addFiles, folders } = this.props; 
		if (!files && !this.state.read) 
		{
			let folderObject = folders.find(stateFolder => folder == stateFolder.path);
			let structuredFiles = {};

			readdir(folder, (err, folderFiles) => {

				let matched = folderFiles.map(file => file.match(ALL_EXTS_REGEX))
					.filter(match => match) // Filter out null values, failed regex match.
					.map(match => match.groups); //Scan for file types we use
				
					matched.forEach(regex => { //Structure of this array will be [original string, file name, file extension, some other stuff]
					if (Object.keys(regex).length) 
					{
						let name = regex.fileName; //Each file has an object with the key as the file name
						let ext  = regex.segMask ? regex.segMask.toUpperCase() : regex.ext.toLowerCase(); //if it's a seg mask like file_C1.png we'll get _C1, else we use the actual ext
						if (!structuredFiles[name]) structuredFiles[name] = {}; // if there is rsml and the png you'll get filename: {rsml: true, png: true}
						structuredFiles[name][ext] = true; //This assumes filename stays consistent for variants of the file. They have to, else there'll be no link I guess. 2x check API behaviour on this.
					}
				});

				let fileKeys = Object.keys(structuredFiles);
				if (fileKeys.length) 
				{
					//Evaluates all files with rsml and sends them to parse in the backend. This is so all the data is available at all times, and not on demand
					//Else exporting measurements won't have any data unless the user has looked at them all in Render, where it gets JiT parsed
					//"Parse on demand upon exporting" - we need the polylines available on gallery for the thumbnails to render RSML when that gets written
					let filesToParse = [];
					fileKeys.forEach(fileName => {
						if ((folderObject.failed || []).includes(fileName)) structuredFiles[fileName].failed = true;
						if (structuredFiles[fileName].rsml) filesToParse.push(folder + sep + fileName);
					});
					addFiles(folder, structuredFiles); //Add our struct with the folder as the key to state
					if (filesToParse.length) ipcRenderer.send(API_PARSE, filesToParse);
				}
				this.setState({ read: true }); //Only try read the filesystem once on import. Having no files in a folder would prompt a read, as it won't know if none were found, or if it just hasn't scanned yet
				//Refresh button can still manually rescan.
			});		
		}
		this.checkThumbs();
	}

	render() {
		//folder - the full path to this folder - in state.gallery.folders
		//files - object of objects keyed by file name, that are in this folder only - state.gallery.files[folder]
		const { isActive, folder, filterText, filterAnalysed, files } = this.props; 
		const filesList = files ? Object.keys(files) : []; // If there are no files (files is undefined), don't try to get the keys!
		const gridCell = createRef(null);

		if ((!filterText || filesList.some(file => file.toLowerCase().includes(filterText))) //Only display folder if there's no filterText, or any of the files includes the filter text
			&& (!filterAnalysed || (files && filesList.some(file => !!files[file].rsml)))) // AND only display folder if the analysed checkbox is off, or any of the files are analysed
		{
			const shortFolder = folder.match(/([^\\\/]+(?:\/|\\){1}[^\\\/]+)$/)[1];
			const formattedFolder = (folder.localeCompare(shortFolder) == 0 ? "" : `..${sep}`) + shortFolder;
			return (
				<StyledFolderCard className="bg-light">
					<StyledCardHeader onClick={e => { !e.target.className.includes("modal") && this.props.toggleOpenFile(folder) } }>
						<StyledFolderViewDiv>
							<StyledIcon className={"fas fa-chevron-right fa-lg"} style={{transitionDuration: '0.5s', transform: `rotate(${isActive ? '90' : '0'}deg)`}}/>
							<TextPopup displayText={formattedFolder} popupText={folder} placement="top"/>
							<this.spinner />
							<div style={{marginLeft: this.state.thumbsGenerating ? "0" : "auto", marginRight: "0"}}>
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
											<this.StyledGridXXL key={index} className={`col-md-3 col-xl-3`} style={{paddingBottom: '1em', textAlign: '-webkit-center'}} ref={gridCell}>
												<Thumbnail folder={folder} fileName={file} parentRef={gridCell}/>
											</this.StyledGridXXL>
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
