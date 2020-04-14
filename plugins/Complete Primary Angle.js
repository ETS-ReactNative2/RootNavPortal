
const group = "Root Measurements";
const name = "Complete Primary Angle";
const id = 'totalPrimaryAngle';
const description = "The angle between the vertical axis and the vector of the start and the tip of the root.";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson); 
        let results = [];

        polylines.forEach(line => {
            if (line.type == "primary") {
                const { plantID, primaryID } = utils.getPlantPrimaryID(line);
                const angle = utils.boundAngle(utils.getAngleBetweenPoints(line.points[line.points.length-1], line.points[0]));
                results.push({ tag: `${tag}:${plantID}-${primaryID}`, [id]: angle });
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