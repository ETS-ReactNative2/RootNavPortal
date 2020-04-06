const group = "Plant Measurements";
const name = "Average Lateral Emergence Angle";
const id = 'latEmergence';
const description = "The mean emergence angle in degrees for all lateral roots. Measured relative to the primary root they emerge from, per plant";

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