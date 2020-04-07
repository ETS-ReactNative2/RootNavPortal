
const group = "Root Measurements";
const name = "Tip Angle";
const id = 'tipAngle';
const description = "Root tip angle in degrees between a root and vertical";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson); 
        let results = [];
        
        polylines.forEach(line => {
                const points = line.points.slice(Math.max(0, line.points.length - 20), line.points.length); // Take last 20 points of array
                //const points = line.points.slice(0, 20); // Take first 20 points of array
                const gradient = utils.linearRegressionGradient(points);
                let angle = utils.boundAngle(utils.gradientToAngle(points, gradient));
            if (line.type == "primary") 
            {
                const { plantID, primaryID } = utils.getPlantPrimaryID(line);
                results.push({ tag: `${tag}:${plantID}-${primaryID}`, [id]: angle });
            }
            else if (line.type == "lateral")
            {
                const { plantID, primaryID, lateralID } = utils.getAllIDs(line);
                results.push({ tag: `${tag}:${plantID}-${primaryID}-${lateralID}`, [id]: angle }); 
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