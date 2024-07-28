"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [takeInput, setTakeInput] = useState(true);

  useEffect(()=>{
    console.log("this is from useEffect")
    console.log(takeInput);
    
  } , [takeInput])

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
    newSocket.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.messageType === "ConnectionConformation") {
        console.log("Connection conformation message received ", message.data);
      } else if (data.messageType === "CommandFromOperator") {
        console.log("Command from operator received ", data);
        console.log(data.takeInput);
        setTakeInput(data.takeInput);
      }
    };
    return () => newSocket.close();
  }, []);

  

  return <div className="text-white">

 <div className="text-white">{`This is the value of takeInput: ${takeInput}`}</div>
   
   </div>;
}
