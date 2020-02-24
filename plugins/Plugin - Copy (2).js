let plugin = (rsmlJson, polylines) => {
	return new Promise((resolve, reject) => {
		resolve("PluginTest1515151 has finished");
	});
};

module.exports = {
    name: "PluginTest1515151",
    group: "PluginGroup2",
    function: plugin
};