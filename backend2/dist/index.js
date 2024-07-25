"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const kMeans_1 = require("./periorityFunction/kMeans");
const PORT = 3000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post('/getperiority', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { floorRequestArray } = req.body; // Destructure directly
        console.log(floorRequestArray);
        const stopsDecided = (0, kMeans_1.decideLiftStops)(floorRequestArray, 2);
        res.status(200).json({
            periorityDecided: stopsDecided // No need to stringify the result
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Something went wrong",
        });
    }
}));
app.listen(PORT, () => {
    console.log("the server is listening on port http://localhost:3000/");
});
const requestsData = [
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
