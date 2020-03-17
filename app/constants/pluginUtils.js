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
        if (!acc[id]) acc[id] = [line];
        else acc[id].push(line);
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
    pointDistance: (p1, p2) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2),
    flatten: lines => lines.map(it => it.points).flat(),
    makeHull: points => {
        let newPoints = points.slice();
        newPoints.sort(pointComparator);
        return makeHullPresorted(newPoints);
    }
};

// Returns the convex hull, assuming that each points[i] <= points[i + 1]. Runs in O(n) time.
makeHullPresorted = points => {
    if (points.length <= 1)
        return points.slice();
    
    // Andrew's monotone chain algorithm. Positive y coordinates correspond to "up"
    // as per the mathematical convention, instead of "down" as per the computer
    // graphics convention. This doesn't affect the correctness of the result.
    
    let upperHull = [];
    for (let i = 0; i < points.length; i++) 
    {
        let p = points[i];
        while (upperHull.length >= 2) 
        {
            let q = upperHull[upperHull.length - 1];
            let r = upperHull[upperHull.length - 2];
            if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) 
                upperHull.pop();
            else break;
        }
        upperHull.push(p);
    }
    upperHull.pop();
    
    let lowerHull = [];
    for (let i = points.length - 1; i >= 0; i--) 
    {
        let p = points[i];
        while (lowerHull.length >= 2) 
        {
            let q = lowerHull[lowerHull.length - 1];
            let r = lowerHull[lowerHull.length - 2];
            if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x))
                lowerHull.pop();
            else break;
        }
        lowerHull.push(p);
    }
    lowerHull.pop();
    
    if (upperHull.length == 1 && lowerHull.length == 1 && upperHull[0].x == lowerHull[0].x && upperHull[0].y == lowerHull[0].y)
        return upperHull;
    else return upperHull.concat(lowerHull);
};
	
	
pointComparator = (a, b) => {
    if (a.x < b.x) return -1;
    else if (a.x > b.x) return +1;
    else if (a.y < b.y) return -1;
    else if (a.y > b.y) return +1;
    else return 0;
};