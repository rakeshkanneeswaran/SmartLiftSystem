"use client";

import { useEffect, useState } from "react";
import axios from "axios";

async function sendToServer(floorRequests, liftId) {
  try {
    const response = await axios.post('http://localhost:3000/getperiority', {
      floorRequestArray: floorRequests,
      liftId: liftId
    });
    console.log(response);
    return true; // Indicate success
  } catch (error) {
    console.error("Error sending data to server:", error);
    return false; // Indicate failure
  }
}

export default function Home() {
  const [takeInput, setTakeInput] = useState(false); // Start with input allowed
  const [floorRequests, setFloorRequests] = useState([]);

  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:3000");
    newSocket.onopen = () => {
      console.log("Connection established");
      newSocket.send(
        JSON.stringify({
          serviceType: "subscribtion",
          SubscribtionType: "RasperryIOTType",
          liftId: "lift1",
        })
      );
    };
    newSocket.onmessage = async (message) => {
      const data = JSON.parse(message.data);
      if (data.messageType === "ConnectionConformation") {
        console.log("Connection conformation message received ", message.data);
      } else if (data.messageType === "CommandFromOperator") {
        console.log("Command from operator received ", data);
        console.log(data.takeInput);

        if (data.takeInput === "allow") {
          setTakeInput(false); // Allow input
        } else if (data.takeInput === "stop") {
          setTakeInput(true); // Stop input
        } else if (data.takeInput === "done") {
          setFloorRequests((prevRequests) => {
            console.log("data sent to /getperiority", prevRequests);
            sendToServer(prevRequests, "lift1");
            return []; // Clear requests after sending
          });
        }
      }
    };
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    console.log("Updated floorRequests:", floorRequests);
  }, [floorRequests]);

  const handleButtonClick = (floor) => {
    if (!takeInput) {
      setFloorRequests((prevRequests) => [
        ...prevRequests,
        { floorRequested: floor },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">SmartLiftSystem</h1>
        <p className="text-xl">Developed under Accelerated Computing Vertical</p>
      </header>
      <div className="mb-8">
        <div>{`This is the value of takeInput: ${takeInput}`}</div>
      </div>
      {takeInput && (
        <div className="bg-red-600 text-white p-4 rounded mb-8">
          The lift is in transit. The operator will soon allow you to enter.
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 10 }, (_, i) => (
          <button
            key={i}
            onClick={() => handleButtonClick(i + 1)}
            className={`w-20 h-20 ${takeInput ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform`}
            disabled={takeInput} // Disable button if takeInput is true
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
