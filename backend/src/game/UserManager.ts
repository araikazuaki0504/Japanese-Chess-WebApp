export class UserManager {
    private static instance : UserManager;
    private userList : Map<"Sente" | "Gote" | "Spectator",number> = new Map<"Sente" | "Gote" | "Spectator",number>();

    private constructor(){}

    static getInstance(): UserManager {
        if (!UserManager.instance) {
            UserManager.instance = new UserManager();
        }
        return UserManager.instance;
    }

    getUserID(userTypeKey : "Sente" | "Gote" | "Spectator") : number | undefined{
        return this.userList.get(userTypeKey);
    }

    getUserType(userIDKey : number) : "Sente" | "Gote" | "Spectator" | undefined{
        for (const [userType, ID] of this.userList) {
            if (userIDKey === ID) {
                return userType;
            }
        }
    }

    changeOwner(userIDKey : number) : "Sente" | "Gote" | undefined {
        var senteGote : "Sente" | "Gote" | "Spectator" = "Spectator";
        for (const [userType, ID] of this.userList) {
            if (userIDKey === ID) {
                senteGote = userType;
            }
        }

        if (senteGote === "Spectator")senteGote = "Gote";
        return senteGote;
    }

    addUser(userType : "Sente" | "Gote" | "Spectator", userID : number, ) {
        this.userList.set(userType,userID);
    }

    removeUserWithUserType(userType : "Sente" | "Gote" | "Spectator") {
        this.userList.delete(userType);
    }

    removeUserWithUserID(userID : number) {
        for (const [userType, ID] of this.userList) {
            if (userID === ID) {
                this.userList.delete(userType);
            }
        }
    }
}