import type { PatchResult } from '../interfaces/PatchResult';

export class Logger {
  constructor(
    private readonly sessionId: string,
    private readonly url: string,
  ) {}

  activity(event: string, data: Record<string, unknown>): void {
    console.log(this.format('activity', event, data));
  }

  error(event: string, data: Record<string, unknown>): void {
    console.error(this.format('error', event, data));
  }

  endSession(result: PatchResult): void {
    this.activity('SESSION_END', {
      patched: result.patched,
      skipped: result.skipped,
      errors: result.errors.length,
    });
  }

  private format(
    type: string,
    event: string,
    data: Record<string, unknown>,
  ): string {
    return JSON.stringify({
      ts: new Date().toISOString(),
      session: this.sessionId,
      url: this.url,
      type,
      event,
      data,
    });
  }
}
