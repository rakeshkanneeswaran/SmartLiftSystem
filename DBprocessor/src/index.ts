import { createClient } from "redis";
const client = createClient();



async function startWorker() {

    try {
        await client.connect();
        console.log("DBProcessor Worker connected to Redis.");

        // Main infinity loop
        while (true) {
            try {
                const dataForPostgress = await client.brPop("DBprocessorQueue",0);
                const parseData = JSON.parse( dataForPostgress.element)
                console.log(parseData)
                //parseData will look like this:

                // {
                //     floorRequestArray: [
                //       { floorRequested: 6 },
                //       { floorRequested: 5 },
                //       { floorRequested: 8 }
                //     ],
                //     stopsDecided: [ 7, 5 ],
                //     liftId: 'lift1',
                //     timeOfRequest: '2024-07-28T13:52:41.499Z'
                //   }
                //}

                // PLEASE MAKE PRISMA AND 
                //ORM

            } catch (error) {
                console.error("Error processing redisData:", error);
            }
        }
    } catch (error) {
        console.error("Failed to connect to Redis", error);
    }
}

startWorker();