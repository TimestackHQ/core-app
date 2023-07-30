import { AWS } from "../../shared";
import mongoose from "mongoose";


export const standardEventPopulation = [{
    path: "cover",
    select: "publicId thumbnail snapshot"
},
{
    path: "users",
    select: "firstName lastName profilePictureSource username"
}, {
    path: "invitees",
    select: "firstName lastName profilePictureSource username"
}
];

