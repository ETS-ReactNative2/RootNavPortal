
const group = "Root Measurements";
const name = "Total Primary Angle";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson); 
        let results = [];
        
		resolve({
            header: [
                { id: 'totalPrimaryAngle', title: name}
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