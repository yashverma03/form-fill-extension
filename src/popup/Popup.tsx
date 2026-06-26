import { useEffect, useState } from 'react';
import type { PatchResult } from '../interfaces/PatchResult';
import type { FillerResultMessage } from '../types/FillerResultMessage';
import styles from './Popup.module.css';

type PopupState =
  | { status: 'loading' }
  | { status: 'success'; result: PatchResult }
  | { status: 'error'; message: string };

/** Extension popup: auto-runs filler on mount and shows results or errors. */
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
        <p className={styles.loadingText}>Filling form…</p>
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main className={styles.main}>
        <p className={styles.errorMessage}>{state.message}</p>
      </main>
    );
  }

  const { patched, skipped, errors } = state.result;
  const rows = [
    { label: 'Patched', value: patched },
    { label: 'Skipped', value: skipped },
    ...(errors.length > 0 ? [{ label: 'Errors', value: errors.length }] : []),
  ];

  return (
    <main className={styles.main}>
      <table className={styles.table}>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
