import { Router } from "express";

export interface IExpressRoute {
    execute(router : Router) : void
}