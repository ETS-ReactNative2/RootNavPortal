
const group = "Plant Measurements";
const name = "Width : Depth Ratio";
const id = 'wdRatio';
const description = "Width to depth ratio per plant";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson); 
        let results = [];
        
        if (!multiplePlants) {
            const extremesX = utils.getExtremesX(polylines);
            const extremesY = utils.getExtremesY(polylines);
            results.push({ tag, [id]: (extremesX.max - extremesX.min)/(extremesY.max - extremesY.min) });
        }
        else {
            const plantsLines = utils.splitLinesAsPlants(polylines);
            Object.entries(plantsLines)
                .map(([plantID, lines]) => [plantID, {x: utils.getExtremesX(lines), y: utils.getExtremesY(lines)}])
                .forEach(([plantID, extremes]) => results.push({ tag: `${tag}:${plantID}`, [id]: (extremes.x.max - extremes.x.min)/(extremes.y.max - extremes.y.min) }))
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