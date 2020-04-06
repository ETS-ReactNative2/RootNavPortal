const group = "Plant Measurements";
const name = "Average Primary Tip Angle";
const id = 'primTipAngle';
const description = "Mean angle in degrees of all primary root tips relative to vertical, per plant;

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson); 
        let results = [];
        
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