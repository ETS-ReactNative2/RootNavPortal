const group = "Plant Measurements";
const name = "Average Primary Emergence Angle";
const id = 'primEmergenceAngle';
const description = "The mean emergence angle in degrees of all primary roots relative to vertical, per plant.";

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