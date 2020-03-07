const group = "Plant Measurements";
const name = "Total Length - Primary";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = rsmlJson.rsml[0].scene[0].plant.length > 1;
        let results = [];
        if (!multiplePlants) results.push({ tag, plantTotalLengthPrimary: 0 });

        polylines.forEach(line => {
            if (line.type == 'lateral') return;

            let distance = utils.lineDistance(line.points);

            if (!multiplePlants) results[0].plantTotalLengthPrimary += distance;
            else
            {
                let plantID = utils.getPlantID(line);
                let object = results.find(record => record.tag == `${tag}:${plantID}`); 
                object ? object.plantTotalLengthPrimary += distance : results.push({ tag: `${tag}:${plantID}`, plantTotalLengthPrimary: distance });
            }
        });

		resolve({
            header: [
                { id: 'plantTotalLengthPrimary', title: name}
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