// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 
import cloneDeep from 'lodash.cloneDeep';
import { jsonOptions, matchPathName } from '../../../constants/globals';
import Parser from 'xml2json';
import { writeFileSync } from 'fs';
import { sep } from 'path';
import TooltipOverlay from '../TooltipOverlay';

export default class SaveRSMLButton extends Component {

    newRSML = {};
    saveRSML = () => {
        const { resetEditStack, updateFile, editStack, parsedRSML: { rsmlJson } } = this.props;
        if (!editStack.length) return;

        //Deep clones the original RSML and diff checks it against the editStack's polylines array to see what is/isn't present and deletes accordingly
        //It's important that the keys are iterated over the original and not the copy, else the splicing will mess up the indexing heavily, but the clone is the one changed
        //Once reconstructed, the file is rewritten to disk, updated in state, and the editStack is cleared.
        this.newRSML = cloneDeep(rsmlJson);
        rsmlJson.rsml[0].scene[0].plant.forEach((plantItem, index) => this.deletePlants(plantItem, index));
        
        let newXML = Parser.toXml(this.newRSML, jsonOptions); //Floats being truncated, and attributes not being de-prefixed
        const { path, fileName } = matchPathName(this.props.path);
        writeFileSync(path + sep + fileName + ".rsml", newXML);
        updateFile(path, fileName, { parsedRSML: { rsmlJson: this.newRSML, polylines: editStack[editStack.length - 1] }} );
        resetEditStack();
    };

    //Checks the plant array to see if any roots exist for a given plant, if not, get rid of it rather than tree searching all its primary/laterals
    //Each layer checks the original JSON against the top of the edit stack to see if the item still exists in the line array.
    //IDs are in the format plantID-primaryID.lateralID
    deletePlants = rsml => {
        if (!rsml) return;
        const { editStack } = this.props;
        const plantID = rsml.id;
        let plant = this.newRSML.rsml[0].scene[0].plant;
        
        if (!editStack[editStack.length - 1].some(line => line.id.startsWith(plantID + '-'))) //If no roots exist from this plant
            plant.splice(plant.findIndex(i => i.id == plantID), 1); //Splice out of array
        else rsml.root.forEach(rootItem => this.deletePrimary(rootItem, plantID)); //if lines found at this level, pass each primary down for the same check
    };

    //Check if any lines exist that are/come from a given primary. If not delete, else it must have some laterals, so pass them down to find out
    deletePrimary = (rsml, parentID) => {
        if (!rsml) return;
        const { editStack } = this.props;
        let plant = this.newRSML.rsml[0].scene[0].plant;
        const primaryID = rsml.id;
        let parentIndex = plant.findIndex(index => index.id == parentID);
        
        if (!editStack[editStack.length - 1].some(line => line.id.startsWith(parentID + '-' + primaryID))) //If no roots exist from this primary
            plant[parentIndex].root.splice(plant[parentIndex].root.findIndex(i => i.id == primaryID), 1); //Indexes will change if already spliced, so we need to guarantee lookup
        else if (rsml.root) 
            rsml.root.forEach(rootItem => this.deleteLateral(rootItem, parentID, primaryID));
    };

    //Checks if the lateral exists, if not, delete it from the mutating json.
    deleteLateral = (rsml, plantID, primaryID) => {
        if (!rsml) return;
        const { editStack } = this.props;
        const lateralID = rsml.id;

        let plant = this.newRSML.rsml[0].scene[0].plant;
        let plantIndex   = plant.findIndex(index => index.id == plantID);
        let primaryIndex = plant[plantIndex].root.findIndex(index => index.id == primaryID);

        if (!editStack[editStack.length - 1].some(line => line.id == plantID + '-' + lateralID)) //lateral ID is 'primaryID.lateralID', so this is fine
            plant[plantIndex].root[primaryIndex].root.splice(plant[plantIndex].root[primaryIndex].root.findIndex(i => i.id == lateralID), 1);
    };

    render() {    
        const isActive = this.props.editStack.length;
        return (
            <TooltipOverlay  component={ props => <span className="d-inline-block" {...props}><StyledButton
                    variant="primary" 
                    disabled={!isActive}
                    style={{pointerEvents: isActive ? 'all' : 'none' }}
                    onClick={this.saveRSML} 
                    className={`btn btn-default fa fa-save button`}
                /></span>
            } 
                text={"Save RSML Changes"}
            />  
        )
    }
}