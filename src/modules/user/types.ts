import { Id } from "@common/id";
import { Password } from "@common/password";
import { Username } from "@common/username";
import { BCryptHash } from "@common/bcryptHash";

export type User = {
    username : Username,
    password : BCryptHash
}

export interface IUserDBModule {
    add(user : User) : Promise<UserDoc>,
    deleteById(id : Id) : Promise<boolean>
    findAll(doc : Object) : Promise<UserDoc[] | null>
    findOne(doc : Object) : Promise<UserDoc | null>
}

export type UserDoc = {
    id : Id,
    username : Username,
    password : BCryptHash,
    timestamp : Date
}

export type UserDocOptional = {
    id? : Id,
    username? : Username,
    password? : BCryptHash,
}