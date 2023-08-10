
import * as AWS from 'aws-sdk';
import * as aws4 from 'aws4';
import { AWSS3ObjectType } from '../@types/global';
import { ManagedUpload } from 'aws-sdk/clients/s3';

const AWS_ACCESS_KEY_ID = 'AKIAUAFCOME3MI6RJV5J';
const AWS_SECRET_ACCESS_KEY = '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';

AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
});

export const signedUrl = async (path: string): Promise<AWSS3ObjectType> => aws4.sign(
    {
        host: 'timestack-private.s3.ca-central-1.amazonaws.com',
        path,
        service: 's3',
        region: 'ca-central-1'
    },
    {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
);

export const upload = async (publicId: string, buffer: Buffer, bucketName: "timestack-profile-pictures" | "timestack-private" = "timestack-private"): Promise<ManagedUpload.SendData> => {
    const s3 = new AWS.S3();

    const params = {
        Bucket: bucketName,
        Key: String("media/" + publicId),
        Body: buffer,
    };

    return new Promise((resolve, reject) => {
        s3.upload(params, (err: any, data: ManagedUpload.SendData) => {
            if (err) {
                reject(err);
            } else {
                console.log(data);
                resolve(data);
            }
        });
    });
};

export const download = async (publicId: string): Promise<Buffer> => {
    return new Buffer("test");
}

export const deleteFile = async (publicId: string): Promise<void> => {

}