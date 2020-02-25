let plugin = (rsmlJson, polylines) => {
	return new Promise((resolve, reject) => {
		resolve("PluginTest has finished");
	});
};

module.exports = {
    name: "PluginTest",
    group: "PluginGroup1",
    function: plugin
};