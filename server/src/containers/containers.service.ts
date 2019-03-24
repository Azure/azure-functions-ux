import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '../shared/http/http.service';

@Injectable()
export class ContainersService {
  constructor(private httpService: HttpService) {}
  async validateContainerImage(url: string, body: unknown, headers: unknown) {
    try {
      await this.httpService.post(url, body, {
        headers,
      });
      return;
    } catch (e) {
      if (e.response && e.response.status) {
        const message = e.message;
        if (e.response.data && e.response.data.content) {
          const [status, errorMessage] = this.parseErrorToResponse(e.response.status, e.response.data.content);
          throw new HttpException(errorMessage, status);
        } else {
          throw new HttpException(message, e.response.status);
        }
      } else if (e.request) {
        throw new HttpException('RequestError', 400);
      } else {
        throw new HttpException(e.code, e.code);
      }
    }
  }

  private parseErrorToResponse(errorStatus: number, errorContent: any): [number, string] {
    try {
      const error = JSON.parse(errorContent);
      if (error.errors && error.errors[0]) {
        return [errorStatus, error.errors[0].message];
      }
      return [errorStatus, 'Error validating image and tag information.'];
    } catch (parseError) {
      return [400, `Could not parse the error payload: ${errorContent}.`];
    }
  }
}
