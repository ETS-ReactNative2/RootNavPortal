const group = "Plant Measurements";
const name = "Primary Root Count";

//Each function is responsible for calculating the measurement on all data for a whole image
//So for plant measurements, this is for each plant, and root measurements, for all roots of all plants
//The entire dataset for the image is provided below, in both raw JSON and accessible polylines:
//rsmlJson - A JSON representation of RSML
//Polylines - an array of objects representing all the parsed points. Contains an ID formatted plantID-primaryID.lateralID, a type: 'primary' or 'lateral'
//and points: an array of objects: { x: ..., y: ... } representing the polyline.
const plugin = (rsmlJson, polylines) => {
	return new Promise((resolve, reject) => {
        let tag = rsmlJson.rsml[0].metadata[0]['file-key'][0]["$t"]; //Location of the tag
        let multiplePlants = rsmlJson.rsml[0].scene[0].plant.length > 1 //Having multiple plants effects our naming conventions - tag:id or just tag
        let results = [];
        if (!multiplePlants) results.push({ tag, primaries: 0 }); //If there aren't, we can initialise easily

        polylines.forEach(line => {
            if (!multiplePlants && line.type == 'primary') return results[0].primaries++;

            if (line.type == 'primary') 
            {
                let plantID = line.id.match(/([0-9]+)/); //Get plant ID
                let object = results.find(record => record.tag == `${tag}:${plantID}`); //Does a record exist
                object ? object.primaries++ : results.push({ tag: `${tag}:${plantID}`, primaries: 1 }); //If so, increment, else add a record for it
            }
        });

        //The tag header is included in the exporter itself, so plugins don't need to worry about duplicating it. It must always be present in the results objects.
		resolve({
            header: [
                { id: 'primaries', title: name} //Specifies what the field name of our data value is, for constructing the CSV later
            ],
            results, //Array of objects: { tag: 'name', primaries: 4 } - name of the object property denoting the data is specified in the header object
            group    //Group is passed through so we can differentiate which result needs to be written to which group's CSV
        });
	});
};

module.exports = {
    name,
    group,
    function: plugin
};