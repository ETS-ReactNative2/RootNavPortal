
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
                let points = line.points.slice(Math.max(0, line.points.length - 20), line.points.length); // Take last 20 points of array
                points = utils.pointsSublistFromDistanceReverse(points, 5); // Cut off points that make length > 5px.
                const gradient = utils.linearRegressionGradient(points);
                let angle = utils.boundAngle(utils.gradientToAngle(points, gradient));
            if (line.type == "primary") 
            {
                const { plantID, primaryID } = utils.getPlantPrimaryID(line);
                results.push({ tag: `${tag}:${plantID}.${primaryID}`, [id]: angle });
            }
            else if (line.type == "lateral")
            {
                const { plantID, primaryID, lateralID } = utils.getAllIDs(line);
                if (plantID == 5 && primaryID == 1 && (lateralID == 20 || lateralID == 21)) {
                    console.log(points);
                    console.log(gradient);
                    console.log(utils.gradientToAngle(points, gradient));
                    console.log(utils.boundAngle(utils.gradientToAngle(points, gradient)));
                }
                results.push({ tag: `${tag}:${plantID}.${primaryID}.${lateralID}`, [id]: angle }); 
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