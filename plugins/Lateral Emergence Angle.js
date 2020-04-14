
const group = "Root Measurements";
const name = "Lateral Emergence Angle";
const id = 'emergenceLateralAngle';
const description = "Angle of emergence in degrees between a lateral root and its parent primary root.";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson); 
        let results = [];

        polylines.forEach(line => {
            if (line.type == "lateral") {
                const { plantID, primaryID, lateralID } = utils.getAllIDs(line);
                const primary = utils.getParentOfLateral(line, polylines);
                let lateralPoints = line.points.slice(0, 20); // Take first 20 points of array
                lateralPoints = utils.pointsSublistFromDistance(lateralPoints, 5); // Cut off points that make length > 5px.
                let primaryPoints = utils.getNearestPointsOrdered(primary.points, line.points[0], 20);
                primaryPoints = utils.pointsSublistFromDistance(primaryPoints, 5); // Cut off points that make length > 5px.

                const lateralGradient = utils.linearRegressionGradient(lateralPoints);
                const primaryGradient = utils.linearRegressionGradient(primaryPoints);

                const lateralAngle = utils.boundAngle(utils.gradientToAngle(lateralPoints, lateralGradient));
                const primaryAngle = utils.boundAngle(utils.gradientToAngle(primaryPoints, primaryGradient));

                const angle = utils.boundAngle(lateralAngle - primaryAngle);
                results.push({ tag: `${tag}:${plantID}-${primaryID}.${lateralID}`, [id]: angle });
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