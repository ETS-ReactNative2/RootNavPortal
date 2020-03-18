
const group = "Root Measurements";
const name = "Total Length";
const id = 'rootTotalLength';
const description = "Total length of each root";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let results = [];

        polylines.forEach(line => {
            let distance = utils.lineDistance(line.points);
            let object = results.find(record => record.tag == `${tag}:${line.id}`); 
            object ? object[id] += distance : results.push({ tag: `${tag}:${line.id}`, [id]: distance });
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