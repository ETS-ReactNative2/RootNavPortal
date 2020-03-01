
const group = "Plant Measurements";
const name = "Average Length - Primary";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = rsmlJson.rsml[0].metadata[0]['file-key'][0]["$t"]; 
        let multiplePlants = rsmlJson.rsml[0].scene[0].plant.length > 1 
        let results = [];
        
        if (!multiplePlants) results.push({ tag, plantAverageLengthPrimary: 0 });
        let plantCounts = {};
        
        polylines.filter(line => line.type == 'primary').forEach((line, index) => {
            let distance = utils.lineDistance(line.points);
            
            if (!multiplePlants) results[0].plantAverageLengthPrimary = utils.addToAverage(results[0].plantAverageLengthPrimary, distance, index + 1);
            else
            {
                let plantID = utils.getPlantID(line);
                if (!plantCounts[plantID]) plantCounts[plantID] = 0;
                let count = plantCounts[plantID];

                let object = results.find(record => record.tag == `${tag}:${plantID}`); 
                object ? object.plantAverageLengthPrimary = utils.addToAverage(object.plantAverageLengthPrimary, distance, ++count) 
                       : results.push({ tag: `${tag}:${plantID}`, plantAverageLengthPrimary: utils.addToAverage(0, distance, ++count) })
            }
        });

		resolve({
            header: [
                { id: 'plantAverageLengthPrimary', title: name}
            ],
            results, 
            group 
        });
	});
};

module.exports = {
    name,
    group,
    function: plugin
};