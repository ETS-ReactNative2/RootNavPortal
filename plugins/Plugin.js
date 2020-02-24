let plugin = (rsmlJson, polylines) => {
	return new Promise((resolve, reject) => {
		resolve(polylines);
	});
};

module.exports = {
    name: "PluginTestALso",
    group: "PluginGroup1",
    function: plugin
};