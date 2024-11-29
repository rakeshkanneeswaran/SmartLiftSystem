"use client";

import React, { useEffect, useState } from "react";

// Define types for WebSocket data
interface WebSocketMessage {
  periorityDecided?: number[];
  status?: string;
  messageType?: "CommandFromRaspberry";
  liftStatus?: boolean;
}

export default function OperatorApp() {
  const [liftStatus, setLiftStatus] = useState<boolean>(false);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [priorityList, setPriorityList] = useState<number[]>([]);
  const [isDoneDisabled, setIsDoneDisabled] = useState<boolean>(false); // State to manage Done button disabled status
  const [countdown, setCountdown] = useState<number>(0); // State to manage the countdown

  useEffect(() => {
    const socket = new WebSocket("https://qkv4bg10-3000.inc1.devtunnels.ms/");
    socket.onopen = () => {
      console.log("WebSocket connection established");

      // Subscribe to the operator service
      socket.send(
        JSON.stringify({
          serviceType: "subscribtion",
          SubscribtionType: "OperatorType",
        })
      );

      // Handle incoming messages
      socket.onmessage = (event: MessageEvent) => {
        const data: WebSocketMessage = JSON.parse(event.data);
        console.log("Received message:", data);

        if (data.messageType === "CommandFromRaspberry") {
          setLiftStatus(data.liftStatus ?? false);
        }

        if (data.periorityDecided) {
          console.log(data.periorityDecided)
          setPriorityList(data.periorityDecided);
        }else if (data.status === "successfully subscribed as liftOperator") {
          setIsConnected(true);
        }
      };

      setWebSocket(socket);
    };

    return () => {
      socket.close();
    };
  }, []);

  const sendCommand = (command: string) => {
    if (webSocket) {
      const message = {
        serviceType: "sendToLift",
        SubscribtionType: "OperatorType",
        liftId: "lift1",
        takeInput: command,
      };
      webSocket.send(JSON.stringify(message));

      if (command === "done") {
        setIsDoneDisabled(true); // Disable the Done button
        setCountdown(10); // Start the countdown at 10 seconds

        const interval = setInterval(() => {
          setCountdown((prevCountdown) => {
            if (prevCountdown > 1) {
              return prevCountdown - 1;
            } else {
              clearInterval(interval);
              setIsDoneDisabled(false); // Re-enable the button after countdown ends
              return 0;
            }
          });
        }, 1000); // Update countdown every second
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 text-gray-100 flex flex-col items-center justify-center p-6 relative">
      {/* Connection Status Badge */}
      <div
        className={`absolute top-4 right-4 px-4 py-2 rounded-full text-white ${isConnected ? 'bg-green-600 animate-pulse' : 'bg-gray-600'}`}
      >
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold mb-3">Operator Control</h1>
      </header>
      <header className="mb-10 text-center">
        <h1 className="text-2xl font-extrabold mb-3">Lift Status: {liftStatus ? "Unlocked" : "Locked"}</h1>
      </header>
      <div className="flex flex-col w-full max-w-3xl">
        <div className="flex flex-col items-center mb-12">
          <div className="text-xl font-semibold mb-6">Priority List</div>
          <div className="space-y-6">
            {priorityList.length > 0 ? (
              priorityList.map((floor, index) => (
                <div key={index} className="bg-white text-red-700 border border-red-700 p-6 rounded-lg shadow-2xl">
                  <h3 className="text-3xl font-bold">{`Floor ${floor}`}</h3>
                </div>
              ))
            ) : (
              <div className="bg-white text-red-700 border border-red-700 p-6 rounded-lg shadow-2xl">
                <p className="text-lg">No priority decided</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center space-y-6">
          <div className="flex space-x-6 mb-6">
            <button
              onClick={() => sendCommand("allow")}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              Unlock
            </button>
            <button
              onClick={() => sendCommand("stop")}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              Lock
            </button>
          </div>
          <button
            onClick={() => sendCommand("done")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            disabled={isDoneDisabled} // Disable the button if isDoneDisabled is true
          >
            {isDoneDisabled ? `Wait for ${countdown}s` : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}
