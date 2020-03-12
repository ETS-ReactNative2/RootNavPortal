
const group = "Plant Measurements";
const name = "Maximum Depth";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson); 
        let results = [];

        if (!multiplePlants) {
            const extremes = utils.getExtremesY(polylines);
            results.push({ tag, maxDepth: extremes.max - extremes.min });
        }
        else {
            const plantsLines = utils.splitLinesAsPlants(polylines);
            Object.entries(plantsLines)
                .map(([plantID, lines]) => [plantID, utils.getExtremesY(lines)])
                .forEach(([plantID, extremes]) => results.push({ tag: `${tag}:${plantID}`, maxDepth: extremes.max - extremes.min }))
        }
		resolve({
            header: [
                { id: 'maxDepth', title: name}
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