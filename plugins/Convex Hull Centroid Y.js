
const group = "Plant Measurements";
const name = "Convex Hull Centroid Y";
const id = 'convexCentroidY';

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson); 
        let results = [];

        let plantPoints = {}
        polylines.forEach(line => {
            let plantID = utils.getPlantID(line); //Get plant ID
            (plantPoints[plantID] = plantPoints[plantID] || []).push(...line.points); //Create an object of plantID: [points], containing all the flattened points of a plant
        });

        Object.keys(plantPoints).forEach(plantID => {
            const points = utils.makeHull(plantPoints[plantID]);
            results.push({
                tag: `${tag}${multiplePlants ? (':'+plantID) : ''}`, 
                [id]: points.reduce((acc, current) => acc += current.y, 0) / points.length - plantPoints[plantID].y
            });
        });

		resolve({
            header: [
                { id, title: name}
            ],
            results, 
            group 
        });
	});
};

module.exports = {
    name,
    group,
    function: plugin
};