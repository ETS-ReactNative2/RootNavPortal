
const group = "Root Measurements";
const name = "Total Length";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = rsmlJson.rsml[0].metadata[0]['file-key'][0]["$t"]; 
        let results = [];

        polylines.forEach(line => {
            let distance = utils.lineDistance(line.points);
            let object = results.find(record => record.tag == `${tag}:${line.id}`); 
            object ? object.rootTotalLength += distance : results.push({ tag: `${tag}:${line.id}`, rootTotalLength: distance });
        });

		resolve({
            header: [
                { id: 'rootTotalLength', title: name}
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