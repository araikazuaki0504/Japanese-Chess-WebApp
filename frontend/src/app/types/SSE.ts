import { gameEventMessageType, editEventMessageType } from "./APIType";

export interface SSEMessageType {
    eventType: "operateEvent" | "editEvent";
    event: gameEventMessageType | editEventMessageType[];
}