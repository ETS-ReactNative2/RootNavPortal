const group = "Plant Measurements";
const name = "Total Length - All Roots";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = rsmlJson.rsml[0].scene[0].plant.length > 1;
        let results = [];
        if (!multiplePlants) results.push({ tag, plantTotalLengthAll: 0 });

        polylines.forEach(line => {
            let distance = utils.lineDistance(line.points);

            if (!multiplePlants) results[0].plantTotalLengthAll += distance;

            else
            {
                let plantID = utils.getPlantID(line);
                let object = results.find(record => record.tag == `${tag}:${plantID}`); 
                object ? object.plantTotalLengthAll += distance : results.push({ tag: `${tag}:${plantID}`, plantTotalLengthAll: distance });
            }
        });

		resolve({
            header: [
                { id: 'plantTotalLengthAll', title: name}
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