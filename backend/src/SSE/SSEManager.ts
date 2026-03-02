import express from "express";

import { SSEMessageType } from "../types/SSEType";

export interface client {
  userID : number;
  res : express.Response;
}

export interface session {
  sessionID : string;
  userID : number;
}

export class SSEManager {
  private static instance : SSEManager;
  private clients = new Map<number,express.Response>();
  private sessions = new Array<session>();
  private userCounter = 0;

  private constructor() {}

  static getInstance(): SSEManager {
    if (!SSEManager.instance) {
        SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }

  generateuserId () : number{
    this.userCounter += 1;
    return this.userCounter;
  }

  getClientCount() : number {
    return this.clients.size;
  }

  getSessionInfo (sessionID : string) : session | undefined {
    return this.sessions.find((session : session) => session.sessionID === sessionID);
  }

  addClient (userID : number, res : express.Response){
    this.clients.set(userID,res);
  }

  removeClient (userID : number) : void  {
    this.clients.delete(userID);
  }

  addSession (sessionID : string, userID : number) {
    this.sessions.push({
      sessionID : sessionID,
      userID : userID
    });
  }

  notifyAll (data : SSEMessageType) : boolean {
    if (this.clients.size === 0) return false;

    this.clients.forEach((client : express.Response) => {
        client.write(`data: ${JSON.stringify(data)}\n\n`);
    });

    return true;
  }

  notifyOne (userID : number, data : SSEMessageType) : boolean {
    const client = this.clients.get(userID);
    if (!client) return false;

    client.write(`data: ${JSON.stringify(data)}\n\n`);
    return true;
  }

  notifyOthers (targetuserID : number, data : SSEMessageType) : boolean {
    if (this.clients.size === 0) return false;

    this.clients.forEach((res : express.Response, userID : number) => {
      if (userID === targetuserID) return;
      const result = res.write(`data: ${JSON.stringify(data)}\n\n`);

        if (!result) {
          console.warn("slow or dead client dropped");
          res.end();
          this.clients.delete(userID);
      }
    });

    return true;
    
  }
}