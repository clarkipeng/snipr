import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
    name: 'sniprStorage',
    access: (allow) => ({
        'snipes/*': [
            allow.authenticated.to(['read', 'write', 'delete']),
            allow.guest.to(['read']),
        ],
    }),
    // @ts-ignore
    cors: [
        {
            allowedOrigins: ['http://localhost:8081', 'exp://127.0.0.1:8081', 'exp://localhost:8081'],
            allowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            allowedHeaders: ['*'],
            exposeHeaders: ['ETag', 'x-amz-server-side-encryption', 'x-amz-request-id', 'x-amz-id-2'],
            maxAgeSeconds: 3000
        }
    ]
});
