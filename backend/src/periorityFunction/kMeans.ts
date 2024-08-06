export interface floorRequest {
    floorRequested: number;
}

// Helper function to calculate Euclidean distance between two points
function euclideanDistance(point1: number[], point2: number[]): number {
    return Math.sqrt(point1.reduce((sum, val, index) => sum + Math.pow(val - point2[index], 2), 0));
}

// K-Means clustering function
function kMeans(data: number[][], k: number, maxIterations: number = 100, tolerance: number = 1e-4): { centroids: number[][], clusters: number[] } {
    try {
        // Initialize centroids randomly
        const centroids: number[][] = data.slice(0, k);
        let clusters: number[] = new Array(data.length).fill(0);
        let converged = false;

        for (let iteration = 0; iteration < maxIterations; iteration++) {
            // Assign clusters
            clusters = data.map(point => {
                return centroids.reduce((nearestIndex, centroid, index) => {
                    return euclideanDistance(point, centroid) < euclideanDistance(point, centroids[nearestIndex]) ? index : nearestIndex;
                }, 0);
            });

            // Update centroids
            const newCentroids: number[][] = Array(k).fill(null).map(() => Array(data[0].length).fill(0));
            const counts: number[] = Array(k).fill(0);

            data.forEach((point, index) => {
                const cluster = clusters[index];
                counts[cluster]++;
                point.forEach((val, dim) => {
                    newCentroids[cluster][dim] += val;
                });
            });

            newCentroids.forEach((centroid, index) => {
                if (counts[index] > 0) {
                    centroid.forEach((val, dim) => {
                        centroid[dim] = val / counts[index];
                    });
                }
            });

            // Check for convergence
            const centroidShift = centroids.reduce((totalShift, centroid, index) => {
                return totalShift + euclideanDistance(centroid, newCentroids[index]);
            }, 0);

            centroids.splice(0, centroids.length, ...newCentroids);

            if (centroidShift < tolerance) {
                converged = true;
                break;
            }
        }

        return { centroids, clusters };
    } catch (error) {
        console.error("An error occurred during k-means clustering:", error);
        return { centroids: [], clusters: [] };
    }
}

// Function to decide lift stops based on k-means clustering
export function decideLiftStops(requests: floorRequest[], k: number): number[] {
    try {
        // Convert requests to a 2D array format
        const data = requests.map(request => [request.floorRequested]);

        // Perform k-means clustering
        const { centroids, clusters } = kMeans(data, k);

        // Extract the floor numbers from the centroids
        const sortedFloors = centroids.map(centroid => centroid[0]);
        return sortedFloors.map(floor => {
            return Math.round(floor)
        });
    } catch (error) {
        console.error("An error occurred while deciding lift stops:", error);
        return [];
    }
}

// // Example usage:
// const requests: floorRequest[] = [
//     { floorRequested: 3 },
//     { floorRequested: 5 },
//     { floorRequested: 3 },
//     { floorRequested: 2 },
//     { floorRequested: 5 },
//     { floorRequested: 5 }
// ];

// const stops = decideLiftStops(requests, 2);
// console.log(stops); // Output: Cluster centers representing the floors