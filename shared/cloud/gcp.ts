import * as Cloud from '@google-cloud/storage';
import * as path from "path";
const serviceKey = path.join(__dirname, './.gc/peppy-plateau-376819-bdf2b94447bd.json')

const { Storage } = Cloud
export const storage = new Storage({
    keyFilename: serviceKey,
    projectId: 'peppy-plateau-376819',
})

export const signedUrl = async (publicId: string): Promise<string> => {
    const options = {
        version: "v4",
        action: "read",
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    };

    const object = await storage
        .bucket(String(process.env.GCP_STORAGE_BUCKET))
        .file(publicId)
        // @ts-ignore
        .getSignedUrl(options)

    return String(object?.[0]);
}

export const upload = async (publicId: string, buffer: Buffer): Promise<string> => {
    const blob = storage
        .bucket(String(process.env.GCP_STORAGE_BUCKET))
        .file(publicId);

    const blobStream = blob.createWriteStream({
        resumable: false
    });

    return await new Promise((resolve, reject) => {
        blobStream.on('finish', async () => {
            const publicUrl =
                `https://storage.googleapis.com/${storage.bucket(String(process.env.GCP_STORAGE_BUCKET)).name}/${blob.name}`

            resolve(publicUrl);
        })
            .on('error', () => {
                reject("error");
            })
            .end(buffer);
    });
}