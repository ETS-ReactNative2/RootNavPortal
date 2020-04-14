
const group = "Plant Measurements";
const name = "Average Length - Lateral";
const id = 'plantAverageLengthLateral';
const description = "Mean length of all lateral roots per plant";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson); 
        let results = [];
        if (!multiplePlants) results.push({ tag, [id]: 0 });
        let plantCounts = {};

        polylines.filter(line => line.type == 'lateral').forEach((line, index) => {
            let distance = utils.lineDistance(line.points);
            
            if (!multiplePlants) results[0][id] = utils.addToAverage(results[0][id], distance, index + 1);
            else
            {
                let plantID = utils.getPlantID(line);
                if (!plantCounts[plantID]) plantCounts[plantID] = 0;

                let object = results.find(record => record.tag == `${tag}:${plantID}`); 
                object ? object[id] = utils.addToAverage(object[id], distance, ++plantCounts[plantID]) 
                       : results.push({ tag: `${tag}:${plantID}`, [id]: utils.addToAverage(0, distance, ++plantCounts[plantID]) })
            }
        });

		resolve({
            header: [
                { id, title: name }
            ],
            results, 
            group 
        });
	});
};

module.exports = {
    name,
    group,
    description,
    function: plugin
};