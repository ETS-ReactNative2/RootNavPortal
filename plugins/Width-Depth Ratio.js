
const group = "Plant Measurements";
const name = "Width : Depth Ratio";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson); 
        let results = [];
        
        if (!multiplePlants) {
            const extremesX = utils.getExtremesX(polylines);
            const extremesY = utils.getExtremesY(polylines);
            results.push({ tag, wdRatio: (extremesX.max - extremesX.min)/(extremesY.max - extremesY.min) });
        }
        else {
            const plantsLines = utils.splitLinesAsPlants(polylines);
            Object.entries(plantsLines)
                .map(([plantID, lines]) => [plantID, {x: utils.getExtremesX(lines), y: utils.getExtremesY(lines)}])
                .forEach(([plantID, extremes]) => results.push({ tag: `${tag}:${plantID}`, wdRatio: (extremes.x.max - extremes.x.min)/(extremes.y.max - extremes.y.min) }))
        }


		resolve({
            header: [
                { id: 'wdRatio', title: name}
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