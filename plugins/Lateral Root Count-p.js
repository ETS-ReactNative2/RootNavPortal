
const group = "Plant Measurements";
const name = "Lateral Root Count";
const id = 'laterals';

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson);;
        let results = [];
        if (!multiplePlants) results.push({ tag, [id]: 0 });

        polylines.forEach(line => {
            if (line.type == 'lateral') {
                if (!multiplePlants) return results[0][id]++;
                else {
                    let plantID = utils.getPlantID(line);
                    let object = results.find(record => record.tag == `${tag}:${plantID}`); 
                    object ? object[id]++ : results.push({ tag: `${tag}:${plantID}`, [id]: 1 });    
                }
            }
        });

		resolve({
            header: [
                { id, title: name}
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