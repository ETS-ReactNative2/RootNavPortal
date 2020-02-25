let plugin = (rsmlJson, polylines) => {
	return new Promise((resolve, reject) => {
		resolve("PluginTestHi has finished");
	});
};

module.exports = {
    name: "PluginTestHi",
    group: "PluginGroup1",
    function: plugin
};