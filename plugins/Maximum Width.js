
const group = "Plant Measurements";
const name = "Maximum Width";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson); 
        let results = [];
        
        if (!multiplePlants) {
            const extremes = utils.getExtremesX(polylines);
            results.push({ tag, maxWidth: extremes.max - extremes.min });
        }
        else {
            const plantsLines = utils.splitLinesAsPlants(polylines);
            Object.entries(plantsLines)
                .map(([plantID, lines]) => [plantID, utils.getExtremesX(lines)])
                .forEach(([plantID, extremes]) => results.push({ tag: `${tag}:${plantID}`, maxWidth: extremes.max - extremes.min }))
        }

		resolve({
            header: [
                { id: 'maxWidth', title: name}
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