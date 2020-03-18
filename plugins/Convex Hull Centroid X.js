
const group = "Plant Measurements";
const name = "Convex Hull Centroid X";
const id = 'convexCentroidX';
const description = "X-axis centroid of the convex hull per plant";

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
                [id]: points.reduce((acc, current) => acc += current.x, 0) / points.length - plantPoints[plantID][0].x
            });
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