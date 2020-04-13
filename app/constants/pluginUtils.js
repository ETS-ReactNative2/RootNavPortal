module.exports = {
    lineDistance: points => {
        let distance = 0;
        if (points.length <= 1) return distance;
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
    getNearestPoint: (points, point) => {
        let closestPoint, closestDistance = Infinity;

        points.forEach(coord => {
            const distance = module.exports.pointDistance(point, coord);
            if (distance < closestDistance) 
            {
                closestDistance = distance;
                closestPoint = coord;
            }
        });
        return closestPoint;
    },
    getNearestPoints: (points, point, count) => {
        count = Math.min(count, points.length);
        let closest = Array.from(Array(count), () => ({ distance: Infinity, point: null }));
        points.forEach(coord => {
            const distance = module.exports.pointDistance(point, coord);
            const maxDistance = Math.max.apply(Math, closest.map(function(o) { return o.distance; }))
            if (distance < maxDistance)
                closest[closest.findIndex(it => it.distance == maxDistance)] = {distance, point: coord};
        });
        return closest.map(it => it.point);
    },
    getNearestPointsOrdered: (points, point, count) => {
        return module.exports.getNearestPoints(points, point, count)
            .map(nearPoint => [nearPoint, points.indexOf(nearPoint)])
            .sort((a, b) => a[1] - b[1])
            .map(it => it[0]);
    },
    getDistanceUntilPoint: (points, breakPoint) => {
        let distance = 0;
        if (points.length == 1) return 0;
        for (let i = 0; i < points.length - 1; i++)
        {
            let p1 = points[i];
            let p2 = points[i+1];
            distance += module.exports.pointDistance(p1, p2);
            if (p2.x == breakPoint.x && p2.y == breakPoint.y) break;
        }
        return distance;
    },
    linearRegressionGradient: points => { // Can return NaN for infinite gradient
        let sumX = 0, sumY = 0; sumXSquared = 0; sumXY = 0;
        points.forEach(coord => {
            sumX += coord.x;
            sumY += coord.y;
            sumXSquared += Math.pow(coord.x, 2);
            sumXY += coord.x * coord.y;
        });
        const gradient = (points.length * sumXY - sumX * sumY) / (points.length * sumXSquared - Math.pow(sumX, 2));
        return gradient;
    },
    gradientToAngle: (points, gradient) => { // Points are used to calculate direction.
        const firstPoint = points[0];
        // Calculate two control points, one moving in each direction along the line.
        const controlPoints = gradient || gradient == 0 ? // Special case for infinite gradient
                                [{x: firstPoint.x + 1, y: firstPoint.y + gradient}, {x: firstPoint.x - 1, y: firstPoint.y - gradient}] : 
                                [{x: firstPoint.x, y: firstPoint.y + 1}, {x: firstPoint.x, y: firstPoint.y - 1}];
        // See which of the check points is closer to each point on the line, to determine the direction. (+x or -x).
        const directions = points
                            .slice(1) // Remove the first element from the array as that was used to calculate the check points
                            .map(point => // See which of the control points it's closer to, 1 for +x, -1 for -x
                                module.exports.pointDistance(point, controlPoints[0]) < module.exports.pointDistance(point, controlPoints[1]) ? 1 : -1
                            );
        // Determine if there's more closer to the positive or the negative control point, to determine if the line moves in the positive or negative direction.
        const numberOfPositive = directions.filter(direction => direction == 1).length;
        // Use this direction to calculate the angle using arctan
        const multiplier = numberOfPositive > directions.length - numberOfPositive ? 1 : -1;
        let angle = gradient || gradient == 0 ? Math.atan2(gradient * multiplier, multiplier) : Math.atan2(multiplier, 0);
        // Convert to degrees, and add 90 degrees to make with respect to the 'negative' y axis instead of the x axis.
        angle = 90 - angle * 180 / Math.PI;
        return angle;
    },
    getAngleBetweenPoints: (anchor, point) => 90 - Math.atan2(anchor.y - point.y, anchor.x - point.x) * 180 / Math.PI,
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
    },
    boundAngle: angle => angle > 180 ? angle - 360 : angle <= -180 ? angle + 360 : angle,
    pointsSublistFromDistance: (points, distance) => {
        let subPoints = [];
        for (let i = 0; i < points.length; ++i) {
            if (subPoints.length >= 2 && module.exports.lineDistance(subPoints) > distance) break;
            subPoints.push(points[i]);
        }
        return subPoints;
    },
    pointsSublistFromDistanceReverse: (points, distance) => {
        let subPoints = [];
        for (let i = points.length - 1; i >= 0; --i) {
            console.log(subPoints);
            console.log(i);
            if (subPoints.length >= 2 && module.exports.lineDistance(subPoints) > distance) break;
            subPoints.unshift(points[i]);
        }
        return subPoints;
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