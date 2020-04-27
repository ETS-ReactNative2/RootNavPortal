const group = "Plant Measurements";
const name = "Average Primary Tip Angle";
const id = 'avgTipPrimaryAngle';
const description = "Mean angle in degrees of all primary root tips relative to vertical, per plant";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson); 
        let results = [];
        if (!multiplePlants) results.push({ tag, [id]: 0 });
        let plantCounts = {};
        
        polylines.filter(line => line.type == "primary").forEach((line, index) => {
            let points = line.points.slice(Math.max(0, line.points.length - 20), line.points.length); // Take last 20 points of array
            points = utils.pointsSublistFromDistanceReverse(points, 5); // Cut off points that make length > 5px.
            const gradient = utils.linearRegressionGradient(points);
            let angle = utils.boundAngle(utils.gradientToAngle(points, gradient));
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