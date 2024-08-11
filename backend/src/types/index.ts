

export interface Operator {
    ws: WebSocket,

}
export interface People {
    ws: WebSocket,
}
export interface RasperryIOT {
    liftId: string,
    ws: WebSocket,
}
export enum SubscribtionType {
    OperatorType = "OperatorType",
    PeopleType = "PeopleType",
    RasperryIOTType = "RasperryIOTType",
}

export enum ServiceType {
    Subscribtion = "subscribtion",
    SendToLift = "sendToLift",
    SendToOperator = "sendToOperator"
}

