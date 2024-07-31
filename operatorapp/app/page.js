"use client";

import { useEffect, useState } from "react";

export default function OperatorApp() {
  const [socket, setSocket] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [priority, setPriority] = useState([]);

  useEffect(() => {
    const newSocket = new WebSocket("https://n7wk5bc5-3000.inc1.devtunnels.ms/");
    newSocket.onopen = () => {
      console.log("WebSocket connection established");

      // Subscribe to the system
      newSocket.send(
        JSON.stringify({
          serviceType: "subscribtion",
          SubscribtionType: "OperatorType",
        })
      );

      // Handle incoming messages
      newSocket.onmessage = (message) => {
        const data = JSON.parse(message.data);
        console.log("Received message:", data);

        if (data.periorityDecided) {
          setPriority(data.periorityDecided);
        } else {
          if (data.status === "successfully subscribed as liftOperator") {
            setIsSubscribed(true);
          }
        }
      };

      // Save the socket connection
      setSocket(newSocket);
    };

    return () => {
      newSocket.close();
    };
  }, []);

  const sendCommand = (command) => {
    if (socket) {
      console.log(
        JSON.stringify({
          serviceType: "sendToLift",
          SubscribtionType: "OperatorType",
          liftId: "lift1",
          takeInput: command,
        })
      );
      socket.send(
        JSON.stringify({
          serviceType: "sendToLift",
          SubscribtionType: "OperatorType",
          liftId: "lift1",
          takeInput: command,
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 text-gray-100 flex flex-col items-center justify-center p-6 relative">
      {/* Connection Badge in Upper Right Corner */}
      <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-white ${
        isSubscribed ? 'bg-green-600 animate-pulse' : 'bg-gray-600'
      }`}>
        {isSubscribed ? 'Connected' : 'Disconnected'}
      </div>

      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold mb-3">Operator Control</h1>
      </header>
      <div className="flex flex-col w-full max-w-3xl">
        <div className="flex flex-col items-center mb-12">
          <div className="text-xl font-semibold mb-6">Priority Decided</div>
          <div className="space-y-6">
            {priority.length > 0 ? (
              priority.map((item, index) => (
                <div
                  key={index}
                  className="bg-white text-red-700 border border-red-700 p-6 rounded-lg shadow-2xl"
                >
                  <h3 className="text-3xl font-bold">{`Floor ${item}`}</h3>
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
              Allow Input
            </button>
            <button
              onClick={() => sendCommand("stop")}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              Stop Input
            </button>
          </div>
          <button
            onClick={() => sendCommand("done")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
