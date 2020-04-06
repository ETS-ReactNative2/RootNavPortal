const group = "Plant Measurements"; //The dropdown within which a plugin will be displayed in. Usually Plant measurements or Root Measurements. A new group will create a new dropdown category.
const name = "Primary Root Count"; //Name the plugin will be displayed as in the list
const id = 'primaries'; //This key must be unique among all plugins
const description = "Total primary roots per plant"; //This is used as the plugin's tooltip text in the side bar.

//This plugin serves as a fully documented example describing how the plugin interface is structured
//Each function is responsible for calculating the measurement on all data for a whole image
//So for plant measurements, this is for each plant, and root measurements, for all roots of all plants within an image
//The entire dataset for the image is provided below, in both raw JSON and unstructured polylines:
//  rsmlJson  - A JSON representation of RSML
//  polylines - an array of objects representing all the parsed points. Contains an ID formatted plantID-primaryID.lateralID, a type: 'primary' or 'lateral'
//      and points: an array of objects: { x: ..., y: ... } representing the polyline.
//      polylines = { id: "1-2.1", type: "lateral", points: [ {x: 334.23, y: 35.76}, {x:, y:}, {}, ...] }
//  utils - an object containing an API of potentially common, useful functions for plugin writing
//Convention for plant measurements is to label each row as `tag` for single plant images, or `tag:plantID` if there are multiple
//And for root measurements, full convention is `tag:plantID-primaryID.lateralID`
//Each plugin must be able to handle the possibility of having multiple plants in an image's dataset.
//A plugin must return a promise, which resolves with an object containing a header array, results array, and the group variable.
//A plugin must export its name, group, description, and function.

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); //Location of the tag
        let multiplePlants = utils.isMultiplePlants(rsmlJson); //Having multiple plants effects our naming conventions - tag:id or just tag
        let results = [];
        if (!multiplePlants) results.push({ tag, [id]: 0 }); //If there aren't, we can initialise easily. Result rows must always include `tag`, and then their returned field

        polylines.forEach(line => {
            if (!multiplePlants && line.type == 'primary') return results[0][id]++;

            if (line.type == 'primary') 
            {
                let plantID = utils.getPlantID(line); //Get plant ID
                let object = results.find(record => record.tag == `${tag}:${plantID}`); //Does a record exist
                object ? object[id]++ : results.push({ tag: `${tag}:${plantID}`, [id]: 1 }); //If so, increment, else add a record for it
            }
        });

        //The tag header is included in the exporter itself, so plugins don't need to worry about duplicating it. It must always be present in the results objects.
		resolve({
            header: [
                { id, title: name } //Specifies what the field name of our data value is, for constructing the CSV later
            ],
            results, //Array of objects: { tag: 'name', primaries: 4 } - name of the object property denoting the data is specified in the header object
            group    //Group is passed through so we can differentiate which result needs to be written to which group's CSV
        });
	});
};

module.exports = {
    name,
    group,
    description,
    function: plugin
};