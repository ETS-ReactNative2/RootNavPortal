
const group = "Root Measurements";
const name = "Lateral Root Count";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let results = [];

        polylines.forEach(line => {

            if (line.type == 'lateral') 
            {
                let { plantID, primaryID } = utils.getPlantPrimaryID(line);
                let object = results.find(record => record.tag == `${tag}:${plantID}-${primaryID}`); 
                object ? object.lateralRootCount++ : results.push({ tag: `${tag}:${plantID}-${primaryID}`, lateralRootCount: 1 });
            }
        });

		resolve({
            header: [
                { id: 'lateralRootCount', title: name}
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