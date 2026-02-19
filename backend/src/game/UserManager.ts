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

    getUserID(userType : "Sente" | "Gote" | "Spectator") : number | undefined{
        return this.userList.get(userType);
    }

    getUserType(userID : number) : "Sente" | "Gote" | "Spectator" | undefined{
        for (const [userType, ID] of this.userList) {
            if (userID === ID) {
                return userType;
            }
        }
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