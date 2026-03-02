export class UserManager {
    private static instance : UserManager;
    private userList : Map<number, "Sente" | "Gote" | "Spectator"> = new Map<number,"Sente" | "Gote" | "Spectator">();

    private constructor(){}

    static getInstance(): UserManager {
        if (!UserManager.instance) {
            UserManager.instance = new UserManager();
        }
        return UserManager.instance;
    }

    isExistUser(userIDKey : number) : boolean {
        return this.userList.has(userIDKey);
    }

    isSpectator(userIDKey : number) : boolean{
        if (!this.isExistUser(userIDKey)) return false;

        const userType = this.getUserType(userIDKey);

        if (userType === "Spectator") return true;
        else return false;
    }

    getUserID(userTypeKey : "Sente" | "Gote" | "Spectator") : number | undefined{
        for (const [ID, userType] of this.userList) {
            if (userType === userTypeKey) {
                return ID;
            }
        }
    }

    getUserType(userIDKey : number) : "Sente" | "Gote" | "Spectator" | undefined{
        return this.userList.get(userIDKey);
    }

    getTeban(userIDKey : number) : "Sente" | "Gote" {
        const userType = this.getUserType(userIDKey);

        if (userType === "Gote" || userType === "Spectator") return "Gote";
        else return "Sente";
    }

    changeOwner(userIDKey : number) : "Sente" | "Gote" | undefined {
        if (this.isExistUser(userIDKey)) return undefined
        
        return this.getTeban(userIDKey);
    }

    addUser(userType : "Sente" | "Gote" | "Spectator", userID : number, ) {
        this.userList.set(userID,userType);
    }

    removeUserWithUserType(targetUserType : "Sente" | "Gote" | "Spectator") {
        for (const [ID,userType] of this.userList) {
            if (userType === targetUserType) {
                this.userList.delete(ID);
            }
        }
    }

    removeUserWithUserID(userID : number) {
        this.userList.delete(userID);
    }
}