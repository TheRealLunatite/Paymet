import { Id } from "@common/id";
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
    registerDate : Date
}

export type UserPrimitiveDoc = {
    id : number,
    username : string,
    password : string,
    timestamp : string
}

export type UserDocOptional = {
    id? : Id,
    username? : Username,
    password? : BCryptHash,
}