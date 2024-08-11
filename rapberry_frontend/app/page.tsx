"use client";

import { useEffect, useState } from "react";
import axios from "axios";

// Define types for WebSocket data
interface FloorRequest {
  floorRequested: number;
}

interface CommandData {
  messageType: string;
  takeInput: string;
  liftStatus?: boolean;
}

async function sendToServer(floorRequests: FloorRequest[], liftId: string): Promise<boolean> {
  try {
    await axios.post('http://localhost:3000/getperiority', {
      floorRequestArray: floorRequests,
      liftId: liftId
    });
    return true; // Indicate success
  } catch (error) {
    console.error("Error sending data to server:", error);
    return false; // Indicate failure
  }
}

export default function LiftApp() {
  const [inputAllowed, setInputAllowed] = useState<boolean>(false); // Start with input allowed
  const [floorRequests, setFloorRequests] = useState<FloorRequest[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [requestCount, setRequestCount] = useState<number>(0); // State to track number of entries

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
      console.log("WebSocket connection established");
      socket.send(
        JSON.stringify({
          serviceType: "subscribtion",
          SubscribtionType: "RasperryIOTType",
          liftId: "lift1",
        })
      );
    };

    socket.onmessage = async (event) => {
      const data: CommandData = JSON.parse(event.data);

      if (data.messageType === "ConnectionConformation") {
        console.log("Connection confirmation received", event.data);
        setIsConnected(true);
      } else if (data.messageType === "CommandFromOperator") {
        console.log("Command from operator received", data);

        switch (data.takeInput) {
          case "allow":
            setInputAllowed(false);
            socket.send(JSON.stringify({
              serviceType: "sendToOperator",
              messageType: "CommandFromRaspberry",
              liftStatus: true
            }));
            break;
          case "stop":
            setInputAllowed(true);
            socket.send(JSON.stringify({
              serviceType: "sendToOperator",
              messageType: "CommandFromRaspberry",
              liftStatus: false
            }));
            break;
          case "done":
            setFloorRequests((prevRequests) => {
              console.log("Sending floor requests to server", prevRequests);
              sendToServer(prevRequests, "lift1");
              setRequestCount(0); // Reset the request count
              return []; // Clear requests after sending
            });
            break;
        }
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleButtonClick = (floor: number) => {
    if (!inputAllowed) {
      setFloorRequests((prevRequests) => {
        const newRequests = [...prevRequests, { floorRequested: floor }];
        setRequestCount(newRequests.length); // Update the request count
        return newRequests;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div
        className={`absolute top-4 right-4 px-4 py-2 rounded-full text-white ${isConnected ? 'bg-green-600 animate-pulse' : 'bg-gray-600'}`}
      >
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">SmartLiftSystem</h1>
        <p className="text-xl">Developed under Accelerated Computing Vertical</p>
      </header>
      {/* Show the number of entries */}
      <div className="mb-8 text-xl font-semibold">
        {requestCount > 0 ? `Number of People: ${requestCount}` : 'No People yet'}
      </div>
      {inputAllowed && (
        <div className="bg-red-600 text-white p-4 rounded mb-8">
          The lift is in transit. The operator will soon allow you to enter.
        </div>
      )}
      <div className="grid grid-cols-2 gap-8"> {/* Increased gap from 4 to 8 */}
        {Array.from({ length: 13 }, (_, i) => (
          <button
            key={i}
            onClick={() => handleButtonClick(i + 3)}  // Start from floor 3
            className={`w-20 h-20 ${inputAllowed ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform`}
            disabled={inputAllowed}
          >
            {i + 3}  {/* Label starts from floor 3 */}
          </button>
        ))}
      </div> 
    </div>
  );
}
