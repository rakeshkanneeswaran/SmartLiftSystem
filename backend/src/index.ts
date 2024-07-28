import express, { Request, Response } from "express";
import { decideLiftStops } from "./periorityFunction/kMeans";
import { Operator, People, RasperryIOT } from "./types";
import { createClient } from "redis";
import { SubscribtionType, ServiceType } from "./types";
import http from 'http';
import { WebSocket, WebSocketServer } from 'ws';

const PORT = 3000

const app = express();
const client = createClient();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const RaspberryWs: RasperryIOT[] = [];
const liftOperatorsWs: Operator[] = [];
const PeopleWs: WebSocket[] = [];



function FromOperatorToRaspberry(ws: WebSocket, message: any) {
    if (message.SubscribtionType == "OperatorType") {
        RaspberryWs.forEach(eachObject => {
            if (eachObject.liftId == message.liftId) {
                eachObject.ws.send(JSON.stringify({
                    messageType : "CommandFromOperator",
                    takeInput: message.takeInput
                }));
            }
        })
    }
}



async function sendToRedis(message: any) {
    const RedisIndexNumber = await client.lPush("DBprocessorQueue", JSON.stringify({ floorRequestArray: message.floorRequestArray, stopsDecided: message.stopsDecided, liftId: message.liftId , timeOfRequest : message.timeOfRequest }))
    console.log(`Data sent to Redis with: ${RedisIndexNumber}`);
}

function SubscribtionHandler(ws: WebSocket, message: any) {
    if (message.SubscribtionType == SubscribtionType.OperatorType) {
        liftOperatorsWs.push({ ws: ws as unknown as globalThis.WebSocket });

        ws.send(JSON.stringify({
            status: "successfully subscribed as liftOperator",
            SubscribtionType: SubscribtionType.OperatorType,
            timestamp: new Date().toISOString()
        }));
    } else if (message.SubscribtionType == SubscribtionType.PeopleType) {
        PeopleWs.push(ws);

        ws.send(JSON.stringify({
            status: "successfully subscribed as people",
            SubscribtionType: SubscribtionType.PeopleType,
            timestamp: new Date().toISOString()
        }));
    } else if (message.SubscribtionType == SubscribtionType.RasperryIOTType) {
        RaspberryWs.push({ ws: ws as unknown as globalThis.WebSocket, liftId: message.liftId });

        ws.send(JSON.stringify({
            messageType : "ConnectionConformation",
            status: "successfully subscribed as Raspberry IOT",
            SubscribtionType: SubscribtionType.RasperryIOTType,
            liftId: message.liftId,
            timestamp: new Date().toISOString()
        }));
    }
}



// HTTP SERVER
app.post('/getperiority', async (req: Request, res: Response) => {
    try {
        const { floorRequestArray } = req.body;
        console.log(floorRequestArray);
        const stopsDecided = decideLiftStops(floorRequestArray, 2);
       

        PeopleWs.forEach(ws => {
            ws.send(JSON.stringify({
                periorityDecided: stopsDecided,
                liftId: req.body.liftId
            }));
        })

        liftOperatorsWs.forEach(eachObject => {
            eachObject.ws.send(JSON.stringify({
                periorityDecided: stopsDecided,
                liftId: req.body.liftId
            }));

        })
        req.body.stopsDecided = stopsDecided;
        req.body.timeOfRequest =  new Date();

        sendToRedis(req.body);

        res.status(200).json({
            periorityDecided: stopsDecided
        });

    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
        });
    }

});


// Websocket SERVER
wss.on('connection', (ws) => {

    console.log('New WebSocket connection');

    ws.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message.toString());
            console.log(parsedMessage)
            if (parsedMessage.serviceType == ServiceType.Subscribtion) {
                SubscribtionHandler(ws, parsedMessage);
            }
            else if (parsedMessage.serviceType == ServiceType.SendToLift) {
                FromOperatorToRaspberry(ws, parsedMessage)
            }

            ws.send(JSON.stringify({ reply: 'Message received' }));
        } catch (error) {
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



async function startServer() {

    try {
        await client.connect();
        console.log("server connected to redis");
        server.listen(PORT, () => {
            console.log(`The server is listening on port http://localhost:${PORT}/ and websocket is listening on port ws://localhost:${PORT}/`);
        });
    } catch (error) {
        console.log(`Error: ${error}`);

    }

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
