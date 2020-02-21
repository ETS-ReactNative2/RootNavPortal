// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 
import cloneDeep from 'lodash.cloneDeep';
import { jsonOptions } from '../../../constants/globals'
import Parser from 'fast-xml-parser';

export default class SaveRSMLButton extends Component {

    newRSML = {};
    saveRSML = () => {
        const { editStack, parsedRSML: { rsmlJson } } = this.props;
        if (!editStack.length) return;

        //Save top of editstack to state.files.[path1].[path2].parsedRSML.simplifiedLines
        //Edit parsedRSML.rsmlJSON to remove the roots we deleted. Removing all roots will need to remove the plant. Idk about segmasks.
        //Convert that rsmlJSON back to RSML and write to disk. Clear the edit stack.
        //We'll need to loop through the JSON, and for each plant, match the root ID and delete the keys - IDs are going to be plant-root.lateral => 1-1.5, 1-2, 2-2.3
        this.newRSML = cloneDeep(rsmlJson);
        rsmlJson.rsml[0].scene[0].plant.forEach((plantItem, index) => this.deletePlants(plantItem, index));
        console.log(this.newRSML);
        let parser = new Parser.j2xParser(jsonOptions);
        let newXML = parser.parse(this.newRSML); //Floats being truncated, and attributes not being de-prefixed
        console.log(newXML);
    };

    //Checks the plant array to see if any roots exist for a given plant, if not, get rid of it rather than tree searching all its primary/laterals
    //Each layer checks the original JSON against the top of the edit stack to see if the item still exists in the line array.
    deletePlants = rsml => {
        if (!rsml) return;
        const { attrNodeName, attributeNamePrefix } = jsonOptions;
        const { editStack } = this.props;
        const plantID = rsml[attrNodeName][attributeNamePrefix + 'id'];
        let plant = this.newRSML.rsml[0].scene[0].plant;
        
        if (!editStack[editStack.length - 1].some(line => line.id.startsWith(plantID + '-'))) //If no roots exist from this plant
            plant.splice(plant.findIndex(i => i[attrNodeName][attributeNamePrefix + 'id'] == plantID), 1) //Splice out of array
        else rsml.root.forEach(rootItem => this.deletePrimary(rootItem, plantID)) //if lines found at this level, pass each primary down for the same check
    };

    //Check if any lines exist that are/come from a given primary. If not delete, else it must have some laterals, so pass them down to find out
    deletePrimary = (rsml, parentID) => {
        if (!rsml) return;
        const { attrNodeName, attributeNamePrefix } = jsonOptions;
        const { editStack } = this.props;
        let plant = this.newRSML.rsml[0].scene[0].plant;
        const primaryID = rsml[attrNodeName][attributeNamePrefix + 'id'];
        let parentIndex = plant.findIndex(index => index[attrNodeName][attributeNamePrefix + 'id'] == parentID);
        
        if (!editStack[editStack.length - 1].some(line => line.id.startsWith(parentID + '-' + primaryID))) //If no roots exist from this primary
            plant[parentIndex].root.splice(plant[parentIndex].root.findIndex(i => i[attrNodeName][attributeNamePrefix + 'id'] == primaryID), 1)//Indexes will change if already spliced, so we need to guarantee lookup
        else if (rsml.root) 
            rsml.root.forEach(rootItem => this.deleteLateral(rootItem, parentID, primaryID))
    };

    //Checks if the lateral exists, if not, delete it from the mutating json.
    deleteLateral = (rsml, plantID, primaryID) => {
        if (!rsml) return;
        const { attrNodeName, attributeNamePrefix } = jsonOptions;
        const { editStack } = this.props;
        const lateralID = rsml[attrNodeName][attributeNamePrefix + 'id'];

        let plant = this.newRSML.rsml[0].scene[0].plant;
        let plantIndex   = plant.findIndex(index => index[attrNodeName][attributeNamePrefix + 'id'] == plantID);
        let primaryIndex = plant[plantIndex].root.findIndex(index => index[attrNodeName][attributeNamePrefix + 'id'] == primaryID);

        if (!editStack[editStack.length - 1].some(line => line.id == plantID + '-' + lateralID)) //lateral ID is 'primaryID.lateralID', so this is fine
            plant[plantIndex].root[primaryIndex].root.splice(plant[plantIndex].root[primaryIndex].root.findIndex(i => i[attrNodeName][attributeNamePrefix + 'id'] == lateralID), 1)
    };

    render() {    
        return (
            <StyledButton
                variant="primary" 
                onClick={this.saveRSML} 
                className={`btn btn-default fa fa-save button`} 
            />    
        )
    }
}