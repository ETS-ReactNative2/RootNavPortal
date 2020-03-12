module.exports = {
    lineDistance: points => {
        let distance = 0;
        for (let i = 0; i < points.length - 1; i++)
        {
            let p1 = points[i];
            let p2 = points[i+1];
            distance += Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
        }
        return distance;
    },
    getPlantID: line => line.id.match(/([0-9]+)/)[1],
    getPlantPrimaryID: line => line.id.match(/([0-9]+)-([0-9]+)/),
    getAllIDs: line => line.id.match(/([0-9]+)-([0-9]+).?([0-9]+)?/),
    addToAverage: (current, newVal, frame) => (current * (frame-1) + newVal) / frame,
    getParentOfLateral: (lateral, polylines) => polylines.find(line => line.id == lateral.id.match(/(\d+\-\d+)/)[1]),
    getTag: json => json.rsml[0].metadata[0]['file-key'][0]["$t"],
    isMultiplePlants: json => json.rsml[0].scene[0].plant.length > 1
}