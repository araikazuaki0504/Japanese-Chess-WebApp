export class User {
    private static instance: User;
    private userType: "Sente" | "Gote" | "Spectator" = "Spectator";
    private userCode: number = 0;

    private constructor() {}

    static getInstance(): User {
        if (!User.instance) {
            User.instance = new User();
        }
        return User.instance;
    }

    setUserType(userType: "Sente" | "Gote" | "Spectator") {
        this.userType = userType;
    }

    setUserCode(userCode: number) {
        this.userCode = userCode;
    }

    getUserType(): "Sente" | "Gote" | "Spectator" {
        return this.userType;
    }

    getUserCode(): number {
        return this.userCode;
    }

    getUserTeban() : "Sente" | "Gote" {
        return this.userType === "Sente" ? "Sente" : "Gote";
    }

    changeOwner(currentTurn: "Sente" | "Gote" | "Spectator") : "Myself" | "Opponent" {
        if (this.userType === "Spectator" || this.userType === "Gote") 
            return currentTurn === "Gote" ? "Myself" : "Opponent";
        else return currentTurn === "Sente" ? "Myself" : "Opponent";
    }

    changeOtherOwner(currentTurn: "Sente" | "Gote" | "Spectator") : "Myself" | "Opponent" {
        if (this.userType === "Spectator" || this.userType === "Gote") 
            return currentTurn === "Sente" ? "Myself" : "Opponent";
        else return this.userType === "Sente" ? "Opponent" : "Myself";
    }
}