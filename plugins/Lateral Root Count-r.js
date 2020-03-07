
const group = "Root Measurements";
const name = "Lateral Root Count";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let results = [];

        polylines.forEach(line => {

            if (line.type == 'lateral') 
            {
                let ids = line.id.match(/([0-9]+)-([0-9]+)/);
                let object = results.find(record => record.tag == `${tag}:${ids[1]}-${ids[2]}`); 
                object ? object.lateralRootCount++ : results.push({ tag: `${tag}:${ids[1]}-${ids[2]}`, lateralRootCount: 1 });
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