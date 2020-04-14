const group = "Plant Measurements";
const name = "Average Lateral Emergence Angle";
const id = 'latEmergence';
const description = "The mean emergence angle in degrees for all lateral roots. Measured relative to the primary root they emerge from, per plant";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson); 
        let results = [];
        if (!multiplePlants) results.push({ tag, [id]: 0 });
        let plantCounts = {};

        polylines.filter(line => line.type == "lateral").forEach((line, index) => {
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
            
            if (!multiplePlants) results[0][id] = utils.addToAverage(results[0][id], angle, index + 1);
            else
            {
                const plantID = utils.getPlantID(line);
                if (!plantCounts[plantID]) plantCounts[plantID] = 0;
                let object = results.find(record => record.tag == `${tag}:${plantID}`); 
                object ? object[id] = utils.addToAverage(object[id], angle, ++plantCounts[plantID]) 
                    : results.push({ tag: `${tag}:${plantID}`, [id]: utils.addToAverage(0, angle, ++plantCounts[plantID]) })
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