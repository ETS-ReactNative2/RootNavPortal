const group = "Plant Measurements";
const name = "Primary Root Count";
const id = 'primaries';
const description = "Total primary roots per plant";

//Each function is responsible for calculating the measurement on all data for a whole image
//So for plant measurements, this is for each plant, and root measurements, for all roots of all plants
//The entire dataset for the image is provided below, in both raw JSON and accessible polylines:
//rsmlJson - A JSON representation of RSML
//Polylines - an array of objects representing all the parsed points. Contains an ID formatted plantID-primaryID.lateralID, a type: 'primary' or 'lateral'
//and points: an array of objects: { x: ..., y: ... } representing the polyline.
//utils - an object containing an API of potentially common, useful functions for plugin writing
//Convention for plant measurements is to label each row as `tag` or `tag:plantID` if there are multiple
//Each plugin must be able to handle the possibility of having multiple plants in an image's dataset.

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