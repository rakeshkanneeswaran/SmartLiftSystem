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
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const client = (0, redis_1.createClient)();
function startWorker() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.connect();
            console.log("DBProcessor Worker connected to Redis.");
            // Main infinity loop
            while (true) {
                try {
                    const dataForPostgress = yield client.brPop("DBprocessorQueue", 0);
                    const parseData = JSON.parse(dataForPostgress.element);
                    console.log(parseData);
                    //dataForPostgress will look like this:
                    // {
                    //     key: 'DBprocessorQueue',
                    //     element: '{"floorRequestArray":[{"floorRequested":3},{"floorRequested":5},{"floorRequested":8}],"stopsDecided":[3,7],"liftId":"lift1","timeOfRequest":"2024-07-28T09:59:28.964Z"}'
                    //   }
                    // PLEASE MAKE PRISMA AND 
                }
                catch (error) {
                    console.error("Error processing redisData:", error);
                }
            }
        }
        catch (error) {
            console.error("Failed to connect to Redis", error);
        }
    });
}
startWorker();
