
const group = "Plant Measurements";
const name = "Maximum Width";
const id = 'maxWidth';

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson); 
        let results = [];
        
        if (!multiplePlants) {
            const extremes = utils.getExtremesX(polylines);
            results.push({ tag, [id]: extremes.max - extremes.min });
        }
        else {
            const plantsLines = utils.groupLinesByPlantID(polylines);
            Object.entries(plantsLines)
                .map(([plantID, lines]) => [plantID, utils.getExtremesX(lines)])
                .forEach(([plantID, extremes]) => results.push({ tag: `${tag}:${plantID}`, [id]: extremes.max - extremes.min }))
        }

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