
const group = "Root Measurements";
const name = "Primary Emergence Angle";
const id = 'emergencePrimaryAngle';
const description = "Angle of emergence in degrees between a primary root and vertical.";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson); 
        let results = [];
        
        polylines.forEach(line => {
            if (line.type == "primary") {
                const { plantID, primaryID } = utils.getPlantPrimaryID(line);
                let points = line.points.slice(0, 20); // Take first 20 points of array
                points = utils.pointsSublistFromDistance(points, 5); // Cut off points that make length > 5px.
                const gradient = utils.linearRegressionGradient(points);
                const angle = utils.boundAngle(utils.gradientToAngle(points, gradient));
                results.push({ tag: `${tag}:${plantID}.${primaryID}`, [id]: angle });
            }
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