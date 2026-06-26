import type { LogRequest } from '../interfaces/LogRequest';

export class Logger {
  log(request: LogRequest, response: string | null): void {
    console.log(JSON.stringify({ request, response }));
  }
}
