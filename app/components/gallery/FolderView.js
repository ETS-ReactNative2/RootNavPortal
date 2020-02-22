// @flow
import React, { Component } from 'react';
import RemoveButton from '../containers/gallery/RemoveButtonContainer';
import SettingsButton from '../containers/gallery/SettingsButtonContainer';
import Thumbnail from '../containers/gallery/ThumbnailContainer';
import { readdir } from 'fs';
import { StyledFolderViewDiv, StyledFolderCard, StyledRow, StyledCardHeader } from './StyledComponents'
import { StyledIcon } from '../CommonStyledComponents'
import { ALL_EXTS_REGEX, IMAGE_EXTS_REGEX, API_ADD, APPHOME, CONFIG } from '../../constants/globals'
import { ipcRenderer } from 'electron';
import { existsSync, writeFile } from 'fs';
import { sep } from 'path';

type Props = {};

export default class FolderView extends Component<Props> {
	shouldComponentUpdate(nextProps, nextState) 
	{
		if (nextProps.filterText !== this.props.filterText || nextProps.filterAnalysed !== this.props.filterAnalysed) return true;
		if (!this.props.files) return true;	//If the folder has no files, don't re-render
		return nextProps.isActive !== this.props.isActive || (JSON.stringify(nextProps.files) !== JSON.stringify(this.props.files));
	}

	onClickFile = (folder, isActive) => {
		this.props.toggleOpenFile(folder);
		this.writeFolderToggled(isActive);
	}

	writeFolderToggled = isActive => {
        const { folders, folder: path } = this.props;
        if (!path) return;
        const updatedFolders = folders.map(folder => folder.path === path ? {...folder, active: isActive } : folder);
        if (existsSync(APPHOME))    //Rewrite config file with removed directories so they don't persist
            writeFile(APPHOME + CONFIG , JSON.stringify(updatedFolders, null, 4), err => {
                if (err) {
                    console.err("Could not write updated folder toggle!");
                    console.err("Folder: " + path + " Active: " + isActive);
                    console.err(err);
                }
            });
    }


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
					if (process.env.API_STATUS)
					{
						let apiFiles = [];
						Object.keys(structuredFiles).forEach(file => {
							if (!structuredFiles[file].rsml)
							{
								let imageExt = Object.keys(structuredFiles[file]).find(ext => ext.match(IMAGE_EXTS_REGEX));
								if (imageExt) apiFiles.push(folder + sep + file + "." + imageExt);
							}
						})
						if (apiFiles.length) ipcRenderer.send(API_ADD, { paths: apiFiles });
					}
					addFiles(folder, structuredFiles); //Add our struct with the folder as the key to state
				}
			});		
		}
		const filesList = files ? Object.keys(files) : []; // If there are no files (files is undefined), don't try to get the keys!
		if ((!filterText || (files && filesList.some(file => file.toLowerCase().includes(filterText.toLowerCase())))) //Only display folder if there's no filterText, or any of the files includes the filter text
		&& (!filterAnalysed || (files && filesList.some(file => !!files[file].rsml)))) // AND only display folder if the analysed checkbox is off, or any of the files are analysed
		{
			return (
				<StyledFolderCard className="bg-light">
					<StyledCardHeader onClick={() => this.onClickFile(folder, isActive)}>
						<StyledFolderViewDiv>
							<StyledIcon className={"fas fa-chevron-" + (isActive ?  "down" : "right") + " fa-lg"}/>
							{folder}
							<div style={{marginLeft: "auto", marginRight: "0"}}>
								<SettingsButton path={folder}/>
								<RemoveButton path={folder}/>
							</div>
						</StyledFolderViewDiv>
					</StyledCardHeader>
					{
						(isActive && files && folder) ? 
							<StyledFolderViewDiv>
								<StyledRow> {filesList
									.filter(file => ((!filterText || file.toLowerCase().includes(filterText.toLowerCase())) && (!filterAnalysed || !!files[file].rsml))) // Remove any files that do not meet the criteria set above.
									.map((file, index) => (
										<div key={index} className="col-lg-3 col-xl-2 col-md-4 col-sm-6" style={{paddingBottom: '1em'}}>
											<Thumbnail folder={folder} fileName={file}/>
										</div>
									))} 
								</StyledRow>
							</StyledFolderViewDiv> 
						: ""							
					}
				</StyledFolderCard>
				);
		}
		else return "";
	}
}
