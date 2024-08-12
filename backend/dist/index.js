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
const redis_1 = require("redis");
const types_1 = require("./types");
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const ws_1 = require("ws");
// make sure not port is runnign on the 3000
const PORT = 3000;
console.log("Something  started");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const client = (0, redis_1.createClient)();
app.use(express_1.default.json());
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
const RaspberryWs = [];
const liftOperatorsWs = [];
const PeopleWs = [];
function FromOperatorToRaspberry(message) {
    if (message.SubscribtionType == "OperatorType") {
        RaspberryWs.forEach(eachObject => {
            if (eachObject.liftId == message.liftId) {
                eachObject.ws.send(JSON.stringify({
                    messageType: "CommandFromOperator",
                    takeInput: message.takeInput // allow , stop , done
                }));
            }
        });
    }
}
function FromRaspberryToOperator(message) {
    console.log(message);
    liftOperatorsWs.forEach((socket) => {
        socket.ws.send(JSON.stringify({
            messageType: "CommandFromRaspberry",
            liftStatus: message.liftStatus
        }));
    });
}
// async function sendToRedis(message: any) {
//     const RedisIndexNumber = await client.lPush("DBprocessorQueue", JSON.stringify({ floorRequestArray: message.floorRequestArray, stopsDecided: message.stopsDecided, liftId: message.liftId , timeOfRequest : message.timeOfRequest }))
//     console.log(`Data sent to Redis with: ${RedisIndexNumber}`);
// }
function SubscribtionHandler(ws, message) {
    if (message.SubscribtionType == types_1.SubscribtionType.OperatorType) {
        liftOperatorsWs.push({ ws: ws });
        ws.send(JSON.stringify({
            status: "successfully subscribed as liftOperator",
            SubscribtionType: types_1.SubscribtionType.OperatorType,
            timestamp: new Date().toISOString()
        }));
    }
    else if (message.SubscribtionType == types_1.SubscribtionType.PeopleType) {
        PeopleWs.push(ws);
        ws.send(JSON.stringify({
            status: "successfully subscribed as people",
            SubscribtionType: types_1.SubscribtionType.PeopleType,
            timestamp: new Date().toISOString()
        }));
    }
    else if (message.SubscribtionType == types_1.SubscribtionType.RasperryIOTType) {
        RaspberryWs.push({ ws: ws, liftId: message.liftId });
        ws.send(JSON.stringify({
            messageType: "ConnectionConformation",
            status: "successfully subscribed as Raspberry IOT",
            SubscribtionType: types_1.SubscribtionType.RasperryIOTType,
            liftId: message.liftId,
            timestamp: new Date().toISOString()
        }));
    }
}
// HTTP SERVER
app.post('/getperiority', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("data received at this endpoint");
        const { floorRequestArray } = req.body;
        console.log(floorRequestArray);
        const stopsDecided = (0, kMeans_1.decideLiftStops)(floorRequestArray, 2);
        PeopleWs.forEach(ws => {
            ws.send(JSON.stringify({
                periorityDecided: stopsDecided,
                liftId: req.body.liftId
            }));
        });
        liftOperatorsWs.forEach(eachObject => {
            eachObject.ws.send(JSON.stringify({
                periorityDecided: stopsDecided,
                liftId: req.body.liftId
            }));
        });
        req.body.stopsDecided = stopsDecided;
        req.body.timeOfRequest = new Date();
        // sendToRedis(req.body);
        res.status(200).json({
            periorityDecided: stopsDecided
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Something went wrong",
        });
    }
}));
// Websocket SERVER
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    ws.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message.toString());
            console.log(parsedMessage);
            if (parsedMessage.serviceType == types_1.ServiceType.Subscribtion) {
                SubscribtionHandler(ws, parsedMessage);
            }
            else if (parsedMessage.serviceType == types_1.ServiceType.SendToOperator) {
                console.log(message);
                FromRaspberryToOperator(parsedMessage);
            }
            else if (parsedMessage.serviceType == types_1.ServiceType.SendToLift) {
                console.log(message);
                FromOperatorToRaspberry(parsedMessage);
            }
            ws.send(JSON.stringify({ reply: 'Message received' }));
        }
        catch (error) {
            ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
    });
    ws.on('close', () => {
        console.log('WebSocket connection closed');
        // Remove from PeopleWs
        const peopleIndex = PeopleWs.indexOf(ws);
        if (peopleIndex !== -1) {
            PeopleWs.splice(peopleIndex, 1);
        }
        // Remove from RaspberryWs
        //@ts-ignore
        const raspberryIndex = RaspberryWs.findIndex(client => client.ws === ws);
        if (raspberryIndex !== -1) {
            RaspberryWs.splice(raspberryIndex, 1);
        }
        // Remove from liftOperatorsWs
        //@ts-ignore
        const liftOperatorIndex = liftOperatorsWs.findIndex(client => client.ws === ws);
        if (liftOperatorIndex !== -1) {
            liftOperatorsWs.splice(liftOperatorIndex, 1);
        }
        console.log(`PeopleWs length: ${PeopleWs.length}`);
        console.log(`RaspberryWs length: ${RaspberryWs.length}`);
        console.log(`liftOperatorsWs length: ${liftOperatorsWs.length}`);
    });
});
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("function ran");
        try {
            yield client.connect();
            console.log("server connected to redis");
            server.listen(PORT, () => {
                console.log(`The server is listening on port http://localhost:${PORT}/ and websocket is listening on port ws://localhost:${PORT}/`);
            });
        }
        catch (error) {
            console.error("this is error");
            console.log(`Error: ${error}`);
        }
    });
}
startServer();
// const requestsData: floorRequest[] = [
//     { floorRequested: 3 },
//     { floorRequested: 5 },
//     { floorRequested: 3 },
//     { floorRequested: 8 },
//     { floorRequested: 8 },
//     { floorRequested: 8 },
//     { floorRequested: 3 },
//     { floorRequested: 3 },
//     { floorRequested: 8 },
//     { floorRequested: 8 },
//     { floorRequested: 8 },
//     { floorRequested: 8 },
//     { floorRequested: 8 },
//     { floorRequested: 8 },
//     { floorRequested: 8 },
//     { floorRequested: 2 },
//     { floorRequested: 5 },
//     { floorRequested: 5 }
// ];
// const stopsDecided = decideLiftStops(requestsData,3);
// console.log(stopsDecided)
