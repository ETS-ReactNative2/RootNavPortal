
const group = "Plant Measurements";
const name = "Maximum Depth";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson); 
        let results = [];

        if (!multiplePlants) {
            const extremes = utils.getExtremesY(polylines);
            results.push({ tag, maxWidth: extremes.max - extremes.min });
        }
        else {
            const plantsLines = utils.splitLinesAsPlants(polylines);
            console.log(plantsLines);
            const test = Object.entries(plantsLines)
                .map(([plantID, lines]) => [plantID, utils.getExtremesY(lines)]);
            console.log(test);
            test.forEach(([plantID, extremes]) => results.push({ tag: `${tag}:${plantID}`, maxWidth: extremes.max - extremes.min }))
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