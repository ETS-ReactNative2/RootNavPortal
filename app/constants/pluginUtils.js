module.exports = {
    lineDistance: points => {
        let distance = 0;
        for (let i = 0; i < points.length - 1; i++)
        {
            let p1 = points[i];
            let p2 = points[i+1];
            distance += module.exports.pointDistance(p1, p2);
        }
        return distance;
    },
    getPlantID: line => line.id.match(/([0-9]+)/)[1],
    getPlantPrimaryID: line => line.id.match(/(?<plantID>[0-9]+)-(?<primaryID>[0-9]+)/).groups,
    getAllIDs: line => line.id.match(/(?<plantID>[0-9]+)-(?<primaryID>[0-9]+).?(?<lateralID>[0-9]+)?/).groups,
    addToAverage: (current, newVal, frame) => (current * (frame-1) + newVal) / frame,
    getParentOfLateral: (lateral, polylines) => polylines.find(line => line.id == lateral.id.match(/(\d+\-\d+)/)[1]),
    getTag: json => json.rsml[0].metadata[0]['file-key'][0]["$t"],
    isMultiplePlants: json => json.rsml[0].scene[0].plant.length > 1,
    getAngle: (anchor, point) => Math.atan2(anchor.y - point.y, anchor.x - point.x) * 180 / Math.PI,
    getNearestPoint: (points, point) => {
        let closestPoint, closestDistance = Infinity;

        points.forEach(coord => {
            let distance = module.exports.pointDistance(point, coord);
            if (distance < closestDistance) 
            {
                closestDistance = distance;
                closestPoint = coord;
            }
        });
        return closestPoint;
    },
    getDistanceUntilPoint: (points, breakPoint) => {
        let distance = 0;
        for (let i = 0; i < points.length - 1; i++)
        {
            let p1 = points[i];
            let p2 = points[i+1];
            distance += module.exports.pointDistance(p1, p2);
            if (p2.x == breakPoint.x && p2.y == breakPoint.y) break;
        }
        return distance;
    },
    groupLinesByPlantID: lines => lines.reduce((acc, line) => {
        const id = module.exports.getPlantID(line);
       (acc[id] = acc[id] || []).push(line);
        return acc;
    }, {}),
    getExtremesX: lines => {
        const xs = lines.map(line => line.points).flat().map(point => point.x); 
        return {min: Math.min(...xs), max: Math.max(...xs)}
    },
    getExtremesY: lines => {
        const ys = lines.map(line => line.points).flat().map(point => point.y);
        return {min: Math.min(...ys), max: Math.max(...ys)}
    },
    pointDistance: (p1, p2) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}