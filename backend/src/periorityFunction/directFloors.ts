interface floorRequest {
    floorRequested: number;
}

export function decideLiftStops(requests: floorRequest[]): number[] {
    try {
        const floorCounts: { [floor: number]: number } = {};

        requests.forEach(request => {
            if (floorCounts[request.floorRequested] !== undefined) {
                floorCounts[request.floorRequested]++;
            } else {
                floorCounts[request.floorRequested] = 1;
            }
        });

        const floorCountArray = Object.entries(floorCounts).map(([floor, count]) => ({
            floor: Number(floor),
            count: Number(count)
        }));

        floorCountArray.sort((a, b) => b.count - a.count);

        const sortedFloors = floorCountArray.map(item => item.floor);

        return sortedFloors;
    } catch (error) {
        console.error("An error occurred while deciding lift stops:", error);
        return [];
    }
}

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