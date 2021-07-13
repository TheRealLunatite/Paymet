import { Id } from "@common/id";
import { Password } from "@common/password";
import { Username } from "@common/username";

export interface IUserDBModule {
    add(user : User) : Promise<UserDoc>
}

export type User = {
    username : Username,
    password : Password
}

export type UserDoc = {
    id : Id,
    username : Username,
    password : Password
}