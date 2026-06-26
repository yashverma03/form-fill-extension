import { useEffect, useState } from 'react';
import type { PatchResult } from '../interfaces/PatchResult';
import type { FillerResultMessage } from '../types/FillerResultMessage';
import styles from './Popup.module.css';

type PopupState =
  | { status: 'loading' }
  | { status: 'success'; result: PatchResult }
  | { status: 'error'; message: string };

export function Popup() {
  const [state, setState] = useState<PopupState>({ status: 'loading' });

  useEffect(() => {
    async function run() {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (!tab?.id) {
          setState({ status: 'error', message: 'No active tab found' });
          return;
        }

        const response = (await chrome.tabs.sendMessage(tab.id, {
          type: 'RUN_FILLER',
        })) as FillerResultMessage | undefined;

        if (!response) {
          setState({
            status: 'error',
            message: 'Content script not available on this page',
          });
          return;
        }

        if (response.error) {
          setState({ status: 'error', message: response.error });
          return;
        }

        setState({ status: 'success', result: response.result });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setState({ status: 'error', message });
      }
    }

    void run();
  }, []);

  if (state.status === 'loading') {
    return (
      <main className={styles.main}>
        <p className={styles.loadingText}>Filling form...</p>
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main className={styles.main}>
        <h1 className={styles.errorTitle}>Error</h1>
        <p className={styles.message}>{state.message}</p>
      </main>
    );
  }

  const { patched, skipped, errors } = state.result;

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Form Filler</h1>
      <p className={styles.message}>
        Patched {patched} field{patched === 1 ? '' : 's'}. {skipped} skipped.{' '}
        {errors.length} error
        {errors.length === 1 ? '' : 's'}.
      </p>
      {errors.length > 0 && (
        <ul className={styles.errorList}>
          {errors.map((error) => (
            <li key={error.inputLabel}>
              {error.inputLabel}: {error.error}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
