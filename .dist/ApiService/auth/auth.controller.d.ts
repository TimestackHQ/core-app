import { NextFunction, Request, Response } from "express";
export declare function login(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function confirmLogin(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function register(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
