export {};
import {UserSchema} from "../../../shared/models/User";

declare global {
    namespace Express {
        interface Request {
            user: UserSchema;
            apiClient?: {
                _id: string;
                name: string;
                apiKey: string;
                active: boolean;
            };
        }
    }
}