
const group = "Plant Measurements";
const name = "Convex Hull Area";

const plugin = (rsmlJson, polylines, utils) => {
	return new Promise((resolve, reject) => {
        let tag = utils.getTag(rsmlJson); 
        let multiplePlants = utils.isMultiplePlants(rsmlJson); 
        let results = [];

        let plantPoints = {}
        polylines.forEach(line => {
            let plantID = utils.getPlantID(line); //Get plant ID
            (plantPoints[plantID] = plantPoints[plantID] || []).push(...line.points); //Create an object of plantID: [points], containing all the flattened points of a plant
        });

        //Take the flattened plant points and construct the results objects with the convex hull areas
        Object.keys(plantPoints).forEach(plantID => {
            results.push({ tag: `${tag}${multiplePlants ? (':'+plantID) : ''}`, convexHull: polygonArea(utils.makeHull(plantPoints[plantID])) });
        });

		resolve({
            header: [
                { id: 'convexHull', title: name}
            ],
            results, 
            group 
        });
	});
};

//Shoelace algorithm calcuating area of our new convex hull
polygonArea = points => { 
    area = 0;   // Accumulates area 
    j = points.length - 1; //array[0] should wrap to array[length] and vice versa

    for (i = 0; i < points.length; i++)
    { 
        area += (points[j].x + points[i].x) * (points[j].y - points[i].y); 
        j = i;  //j is previous vertex to i
    }
    return area / 2;
};


// Returns a new array of points representing the convex hull of the given set of points.
// Runs in O(n log n) time
makeHull = points => {
    var newPoints = points.slice();
    newPoints.sort(pointComparator);
    return makeHullPresorted(newPoints);
};

// Returns the convex hull, assuming that each points[i] <= points[i + 1]. Runs in O(n) time.
makeHullPresorted = points => {
    if (points.length <= 1)
        return points.slice();
    
    // Andrew's monotone chain algorithm. Positive y coordinates correspond to "up"
    // as per the mathematical convention, instead of "down" as per the computer
    // graphics convention. This doesn't affect the correctness of the result.
    
    var upperHull = [];
    for (var i = 0; i < points.length; i++) 
    {
        var p = points[i];
        while (upperHull.length >= 2) 
        {
            var q = upperHull[upperHull.length - 1];
            var r = upperHull[upperHull.length - 2];
            if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) 
                upperHull.pop();
            else break;
        }
        upperHull.push(p);
    }
    upperHull.pop();
    
    var lowerHull = [];
    for (var i = points.length - 1; i >= 0; i--) 
    {
        var p = points[i];
        while (lowerHull.length >= 2) 
        {
            var q = lowerHull[lowerHull.length - 1];
            var r = lowerHull[lowerHull.length - 2];
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

module.exports = {
    name,
    group,
    function: plugin
};