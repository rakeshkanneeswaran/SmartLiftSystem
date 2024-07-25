import express, { Request, Response } from "express";
import { floorRequest } from "./periorityFunction/kMeans";
import { decideLiftStops } from "./periorityFunction/kMeans";

const PORT = 3000
const app = express();
app.use(express.json());
app.post('/getperiority', async (req: Request, res: Response) => {
    try {
        const { floorRequestArray } = req.body; // Destructure directly
        console.log(floorRequestArray);
        const stopsDecided = decideLiftStops(floorRequestArray, 2);
        res.status(200).json({
            periorityDecided: stopsDecided // No need to stringify the result
        });
    } catch (error) {
        res.status(500).json({ // Use 500 for server errors
            message: "Something went wrong",
        });
    }
});


app.listen(PORT, () => {
    console.log("the server is listening on port http://localhost:3000/")
}
)

const requestsData: floorRequest[] = [
    { floorRequested: 3 },
    { floorRequested: 5 },
    { floorRequested: 3 },
    { floorRequested: 8 },
    { floorRequested: 8 },
    { floorRequested: 8 },
    { floorRequested: 3 },
    { floorRequested: 3 },
    { floorRequested: 8 },
    { floorRequested: 8 },
    { floorRequested: 8 },
    { floorRequested: 8 },
    { floorRequested: 8 },
    { floorRequested: 8 },
    { floorRequested: 8 },
    { floorRequested: 2 },
    { floorRequested: 5 },
    { floorRequested: 5 }
];

// const stopsDecided = decideLiftStops(requestsData,3);
// console.log(stopsDecided)
