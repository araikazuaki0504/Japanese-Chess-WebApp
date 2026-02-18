import express from "express";

export interface client {
  playerID : number;
  res : express.Response;
}

export interface session {
  sessionID : string;
  playerID : number;
}

export class SSEManager {
  private static instance : SSEManager;
  private clients = new Map<number,express.Response>();
  private sessions = new Array<session>();
  private playerCounter = 0;

  private constructor() {}

  static getInstance(): SSEManager {
    if (!SSEManager.instance) {
        SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }

  generatePlayerId () : number{
    this.playerCounter += 1;
    return this.playerCounter;
  }

  getClientCount() : number {
    return this.clients.size;
  }

  getSessionInfo (sessionID : string) : session | undefined {
    return this.sessions.find((session : session) => session.sessionID === sessionID);
  }

  addClient (playerID : number, res : express.Response){
    this.clients.set(playerID,res);
  }

  removeClient (playerID : number) : void  {
    this.clients.delete(playerID);
  }

  addSession (sessionID : string, playerID : number) {
    this.sessions.push({
      sessionID : sessionID,
      playerID : playerID
    });
  }

  notifyAll (data : unknown) : boolean {
    if (this.clients.size === 0) return false;

    this.clients.forEach((client : express.Response) => {
        client.write(`data: ${JSON.stringify(data)}\n\n`);
    });

    return true;
  }

  notifyOne (playerID : number, data : unknown) : boolean {
    const client = this.clients.get(playerID);
    if (!client) return false;

    client.write(`data: ${JSON.stringify(data)}\n\n`);
    return true;
  }

  notifyOthers (targetPlayerID : number, data : unknown) : boolean {
    if (this.clients.size === 0) return false;


    this.clients.forEach((res : express.Response, playerID : number) => {
      if (playerID === targetPlayerID) return;
      const result = res.write(`data: ${JSON.stringify(data)}\n\n`);

        if (!result) {
          console.warn("slow or dead client dropped");
          res.end();
          this.clients.delete(playerID);
      }
    });

    return true;
    
  }
}