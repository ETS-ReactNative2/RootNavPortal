
const group = "Plant Measurements";
const name = "Centroid X";
const id = 'centroidX';
const description = "The mean X position relative to the seed location calculated per plant across all roots.";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson); 
        let results = [];

        if (!multiplePlants) 
        {
            const points = utils.flatten(polylines);
            results.push({ tag, [id]: points.reduce((acc, current) => acc += current.x, 0) / points.length - points[0].x });
        }
        else 
        {
            const plantsLines = utils.groupLinesByPlantID(polylines);
            Object.entries(plantsLines)
                .map(([plantID, lines]) => [plantID, utils.flatten(lines)])
                .forEach(([plantID, points]) => results.push({ tag: `${tag}:${plantID}`, [id]: points.reduce((acc, current) => acc += current.x, 0) / points.length - points[0].x }));
        }

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