import { Guid } from './../Utilities/Guid';
import { Headers } from '@angular/http';

// Used so that the UserService can do initialization work without having to depend
// on the ArmService which would create a circular dependency
export class ArmServiceHelper {
    public static armEndpoint = window.appsvc.env.azureResourceManagerEndpoint;

    public static getHeaders(token: string, sessionId?: string, etag?: string): Headers {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Authorization', `Bearer ${token}`);
        headers.append('x-ms-client-request-id', Guid.newGuid());

        if (sessionId) {
            headers.append('x-ms-client-session-id', sessionId);
        }

        if (etag) {
            headers.append('If-None-Match', etag);
        }

        return headers;
    }
}
