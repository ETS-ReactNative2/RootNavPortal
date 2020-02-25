let plugin = (rsmlJson, polylines) => {
	return new Promise((resolve, reject) => {
		resolve("MyPlugin has finished");
	});
};

module.exports = {
    name: "MyPlugin",
    group: "PluginGroup2",
    function: plugin
};
