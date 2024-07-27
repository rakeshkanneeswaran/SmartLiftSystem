# Lift Management System

This project implements a lift management system using a combination of HTTP and WebSocket servers. The system includes different clients: operators, people, and Raspberry IOT devices. The communication between these clients and the server is handled through specific request and response formats.


The server will be running on `http://localhost:3000` and WebSocket connections can be made to `ws://localhost:3000`.

## HTTP Endpoints

### `/getperiority`

This endpoint processes floor requests and decides the priority stops for the lift.

#### Request

- Method: `POST`
- URL: `http://localhost:3000/getperiority`
- Headers: `Content-Type: application/json`
- Body:

```json
{
  "floorRequestArray": [
    { "floorRequested": 3 },
    { "floorRequested": 5 },
    { "floorRequested": 8 }
  ],
  "liftId": "lift1"
}
```

#### Response

- Success Response:

```json
{
  "periorityDecided": [3, 5, 8]
}
```

- Error Response:

```json
{
  "message": "Something went wrong"
}
```

## WebSocket Server

### WebSocket Connection

Clients can connect to the WebSocket server at `ws://localhost:3000`.

### Subscription Types

1. **Operator**
2. **People**
3. **Raspberry IOT**

### WebSocket Messages

#### Subscription Request

Clients need to send a subscription request to subscribe as an operator, people, or Raspberry IOT device.

**Request**

```json
{
  "serviceType": "subscribtion",
  "SubscribtionType": "OperatorType" // or "PeopleType" or "RasperryIOTType"
}
```

**Response**

```json
{
  "status": "successfully subscribed as liftOperator", // or "successfully subscribed as people" or "successfully subscribed as Raspberry IOT"
  "SubscribtionType": "OperatorType", // or "PeopleType" or "RasperryIOTType"
  "timestamp": "2024-07-26T10:00:00.000Z",
  "liftId": "lift1" // Only for Raspberry IOT
}
```

#### Send To Lift

Operators can send messages to Raspberry IOT devices.

**Request**

```json
{
  "serviceType": "sendToLift",
  "SubscribtionType": "OperatorType",
  "liftId": "lift1",
  "takeInput": true
}
```

**Response**

```json
{
  "reply": "Message received"
}
```

### WebSocket Message Handling

#### Receiving Messages

When a message is received on the WebSocket server, it will be parsed and handled based on the `serviceType`.

**Message Format**

```json
{
  "serviceType": "subscribtion", // or "sendToLift"
  ...
}
```

**Invalid Message Format**

```json
{
  "error": "Invalid message format"
}
```

## Example Usage

### Operator Subscription

1. Connect to the WebSocket server at `ws://localhost:3000`.
2. Send a subscription message:

```json
{
  "serviceType": "subscribtion",
  "SubscribtionType": "OperatorType"
}
```

### Sending Data to Raspberry IOT

1. Ensure you are subscribed as an operator.
2. Send a message to the lift:

```json
{
  "serviceType": "sendToLift",
  "SubscribtionType": "OperatorType",
  "liftId": "lift1",
  "takeInput": true
}
```

### People Subscription

1. Connect to the WebSocket server at `ws://localhost:3000`.
2. Send a subscription message:

```json
{
  "serviceType": "subscribtion",
  "SubscribtionType": "PeopleType"
}
```

### Raspberry IOT Subscription

1. Connect to the WebSocket server at `ws://localhost:3000`.
2. Send a subscription message:

```json
{
  "serviceType": "subscribtion",
  "SubscribtionType": "RasperryIOTType",
  "liftId": "lift1"
}
```

## Additional Information

- This system uses a priority function to determine the stops for the lift based on the floor requests received.
- The WebSocket server manages multiple types of clients, each with different roles and functionalities within the lift management system.

For any further questions or issues, please refer to the documentation or contact the project maintainers.