interface floorRequest {
    floorRequested: number;
}

export function decideLiftStops(requests: floorRequest[]): number[] {
    // Create a map to count the requests for each floor
    const floorCounts: { [floor: number]: number } = {};

    requests.forEach(request => {
        if (floorCounts[request.floorRequested] !== undefined) {
            floorCounts[request.floorRequested]++;
        } else {
            floorCounts[request.floorRequested] = 1;
        }
    });

    // Convert the floorCounts object to an array of [floor, count] tuples
    const floorCountArray = Object.entries(floorCounts).map(([floor, count]) => ({
        floor: Number(floor),
        count: Number(count)
    }));

    // Sort the array by count in descending order (most requested floors first)
    floorCountArray.sort((a, b) => b.count - a.count);

    // Extract the sorted floors
    const sortedFloors = floorCountArray.map(item => item.floor);

    return sortedFloors;
}

// Example usage:
const requests: floorRequest[] = [
    { floorRequested: 3 },
    { floorRequested: 5 },
    { floorRequested: 3 },
    { floorRequested: 2 },
    { floorRequested: 5 },
    { floorRequested: 5 }
];

const stops = decideLiftStops(requests);
console.log(stops); // Output: [5, 3, 2]
