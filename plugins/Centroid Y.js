
const group = "Plant Measurements";
const name = "Centroid Y";
const id = 'centroidY';
const description = "text";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson); 
        let results = [];
        
        if (!multiplePlants) 
        {
            const points = utils.flatten(polylines);
            results.push({ tag, [id]: points.reduce((acc, current) => acc += current.y, 0) / points.length - points[0].y });
        } 
        else 
        {
            const plantsLines = utils.groupLinesByPlantID(polylines);
            Object.entries(plantsLines)
                .map(([plantID, lines]) => [plantID, utils.flatten(lines)])
                .forEach(([plantID, points]) => results.push({ tag: `${tag}:${plantID}`, [id]: points.reduce((acc, current) => acc += current.y, 0) / points.length - points[0].y }));
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