import { Password } from "@common/password";
import { Username } from "@common/username";

export type RegisterBody = {
    username : Username,
    password : Password
}