
const group = "Plant Measurements";
const name = "Average Length - Primary";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson); 
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

                let object = results.find(record => record.tag == `${tag}:${plantID}`); 
                object ? object.plantAverageLengthPrimary = utils.addToAverage(object.plantAverageLengthPrimary, distance, ++plantCounts[plantID]) 
                       : results.push({ tag: `${tag}:${plantID}`, plantAverageLengthPrimary: utils.addToAverage(0, distance, ++plantCounts[plantID]) })
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