
const group = "Plant Measurements";
const name = "Convex Hull Area";

const plugin = (rsmlJson, polylines) => {
	return new Promise((resolve, reject) => {
        let tag = rsmlJson.rsml[0].metadata[0]['file-key'][0]["$t"]; 
        let multiplePlants = rsmlJson.rsml[0].scene[0].plant.length > 1 
        let results = [];
        
		resolve({
            header: [
                { id: 'convexHull', title: name}
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