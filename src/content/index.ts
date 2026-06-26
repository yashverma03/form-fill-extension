import { ANSWERS_CONFIG } from '../config/answers.config';
import { AnswerResolver } from '../services/AnswerResolver';
import { FormExtractor } from '../services/FormExtractor';
import { FormPatcher } from '../services/FormPatcher';
import { Logger } from '../services/Logger';
import type { ContentMessage } from '../types/ContentMessage';
import type { FillerResultMessage } from '../types/FillerResultMessage';

function createSessionId(): string {
  return Math.random().toString(36).slice(2, 6);
}

async function runFiller(): Promise<FillerResultMessage> {
  const sessionId = createSessionId();
  const url = window.location.href;
  const logger = new Logger(sessionId, url);

  logger.activity('SESSION_START', {});

  const extractor = new FormExtractor();
  const inputs = extractor.extract();

  if (inputs.length === 0) {
    logger.activity('NO_INPUTS_FOUND', {});
    const emptyResult = { patched: 0, skipped: 0, errors: [] };
    logger.endSession(emptyResult);
    return { type: 'FILLER_RESULT', result: emptyResult };
  }

  logger.activity('EXTRACT_COMPLETE', { count: inputs.length, url });

  const resolver = new AnswerResolver(ANSWERS_CONFIG);
  const resolved = resolver.resolve(inputs);

  let matched = 0;
  let unmatched = 0;

  for (const patch of resolved) {
    if (patch.skippedReason === 'already_filled') {
      logger.activity('PATCH_SKIPPED', {
        inputLabel: patch.input.labelText,
        reason: 'already_filled',
      });
      continue;
    }

    if (patch.answer === null) {
      unmatched += 1;
      const question = resolver.getQuestionText(patch.input);
      logger.activity('NO_MATCH', {
        inputLabel: patch.input.labelText,
        reason: patch.skippedReason ?? 'no_match',
        bestScore: resolver.getBestMatchScore(question),
      });
      continue;
    }

    matched += 1;
    logger.activity('MATCH_FOUND', {
      inputLabel: patch.input.labelText,
      configIndex: patch.configIndex,
      score: patch.matchScore,
      answer: patch.answer,
    });
  }

  logger.activity('RESOLVE_COMPLETE', { matched, unmatched });

  const patcher = new FormPatcher();
  const result = patcher.patch(resolved);

  for (const patch of resolved) {
    if (patch.answer === null || patch.skippedReason) {
      continue;
    }

    const hadError = result.errors.some(
      (error) => error.inputLabel === patch.input.labelText,
    );
    if (hadError) {
      const patchError = result.errors.find(
        (error) => error.inputLabel === patch.input.labelText,
      );
      logger.error('PATCH_ERROR', {
        inputLabel: patch.input.labelText,
        error: patchError?.error ?? 'Unknown error',
      });
      continue;
    }

    logger.activity('PATCH_APPLIED', {
      inputLabel: patch.input.labelText,
      inputType: patch.input.inputType,
      answer: patch.answer,
    });
  }

  logger.endSession(result);

  return { type: 'FILLER_RESULT', result };
}

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
