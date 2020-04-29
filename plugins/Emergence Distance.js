
const group = "Root Measurements";
const name = "Emergence Distance";
const id = 'emergenceDistance';
const description = "Length upon a primary root that each lateral emerges from";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let results = [];
        
        polylines.forEach(line => {
            let { lateralID } = utils.getAllIDs(line);
            if (!lateralID) return; //if it's a primary root, it has no emergence angle

            let parent = utils.getParentOfLateral(line, polylines);
            let emergenceDistance = utils.getDistanceUntilPoint(parent.points, utils.getNearestPoint(parent.points, line.points[0]));
            results.push({ tag: `${tag}:${line.id}`, [id]: emergenceDistance });
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