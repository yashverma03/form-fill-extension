import type { LogRequest } from '../interfaces/LogRequest';

/** Logs question-to-answer pairs as JSON for debugging unmatched fields. */
export class Logger {
  /** Emits `{ request, response }` to the console. */
  log(request: LogRequest, response: string | null): void {
    console.log(JSON.stringify({ request, response }));
  }
}
