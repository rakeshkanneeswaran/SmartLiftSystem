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
                console.log(dataForPostgress)
                //dataForPostgress will look like this:

                // {
                //     key: 'DBprocessorQueue',
                //     element: '{"floorRequestArray":[{"floorRequested":3},{"floorRequested":5},{"floorRequested":8}],"stopsDecided":[3,7],"liftId":"lift1","timeOfRequest":"2024-07-28T09:59:28.964Z"}'
                //   }

                // PLEASE MAKE PRISMA AND 

            } catch (error) {
                console.error("Error processing redisData:", error);
            }
        }
    } catch (error) {
        console.error("Failed to connect to Redis", error);
    }
}

startWorker();