import { NextFunction, Request, Response } from "express";
export declare function createEvent(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getOne(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function respond(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function confirm(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
