import { Password } from "@common/password";
import { Username } from "@common/username";

export type RequestBody = {
    username : Username,
    password : Password
}