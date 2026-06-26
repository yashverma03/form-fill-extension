import { ANSWERS_CONFIG } from '../config/answers.config';
import { ANSWERS_DATA } from '../data/answers.data';
import { AnswerResolver } from '../services/AnswerResolver';
import { FormExtractor } from '../services/FormExtractor';
import { FormPatcher } from '../services/FormPatcher';
import { Logger } from '../services/Logger';
import type { ContentMessage } from '../types/ContentMessage';
import type { FillerResultMessage } from '../types/FillerResultMessage';

/** Orchestrates extract → resolve → log → patch on the current page. */
async function runFiller(): Promise<FillerResultMessage> {
  const logger = new Logger();
  const extractor = new FormExtractor();
  const inputs = extractor.extract();

  if (inputs.length === 0) {
    const emptyResult = { patched: 0, skipped: 0, errors: [] };
    return { type: 'FILLER_RESULT', result: emptyResult };
  }

  const resolver = new AnswerResolver(ANSWERS_CONFIG, ANSWERS_DATA);
  const resolved = resolver.resolve(inputs);

  for (const patch of resolved) {
    logger.log(resolver.getLogRequest(patch.input), patch.answer);
  }

  const patcher = new FormPatcher();
  const result = patcher.patch(resolved);

  return { type: 'FILLER_RESULT', result };
}

/** Handles RUN_FILLER from the popup; responds asynchronously with FILLER_RESULT. */
chrome.runtime.onMessage.addListener(
  (message: ContentMessage, _sender, sendResponse) => {
    if (message.type !== 'RUN_FILLER') {
      return false;
    }

    void runFiller()
      .then((response) => sendResponse(response))
      .catch((error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        sendResponse({
          type: 'FILLER_RESULT',
          result: { patched: 0, skipped: 0, errors: [] },
          error: errorMessage,
        } satisfies FillerResultMessage);
      });

    return true;
  },
);
