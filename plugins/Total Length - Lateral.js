const group = "Plant Measurements";
const name = "Total Length - Lateral";
const id = 'plantTotalLengthLateral';

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson);;
        let results = [];
        if (!multiplePlants) results.push({ tag, [id]: 0 });

        polylines.forEach(line => {
            if (line.type == 'primary') return;

            let distance = utils.lineDistance(line.points);

            if (!multiplePlants) results[0][id] += distance;
            else
            {
                let plantID = utils.getPlantID(line);
                let object = results.find(record => record.tag == `${tag}:${plantID}`); 
                object ? object[id] += distance : results.push({ tag: `${tag}:${plantID}`, [id]: distance });
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