
import * as AWS from 'aws-sdk';
import * as aws4 from 'aws4';

const AWS_ACCESS_KEY_ID = 'AKIAUAFCOME3MI6RJV5J';
const AWS_SECRET_ACCESS_KEY = '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';

AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
});

export const signedUrl = async (publicId: string) => {

    var opts = {
        host: 'timestack-private.s3.ca-central-1.amazonaws.com',
        path: '/media/' + publicId,
        service: 's3',
        region: 'ca-central-1'
    }

    return aws4.sign(opts, { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY });

}

export const upload = async (publicId: string, buffer: Buffer) => {
    const s3 = new AWS.S3();

    const params = {
        Bucket: "timestack-private",
        Key: String("media/" + publicId),
        Body: buffer,
    };

    return new Promise((resolve, reject) => {
        s3.upload(params, (err: any, data: any) => {
            if (err) {
                reject(err);
            } else {
                console.log(data);
                resolve(data.Location);
            }
        });
    });
};

export const download = async (publicId: string): Promise<Buffer> => {
    return new Buffer("test");
}

export const deleteFile = async (publicId: string): Promise<void> => {

}