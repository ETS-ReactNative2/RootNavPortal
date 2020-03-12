
const group = "Root Measurements";
const name = "Emergence Distance";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson); 
        let results = [];
        
		resolve({
            header: [
                { id: 'emergenceDistance', title: name}
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