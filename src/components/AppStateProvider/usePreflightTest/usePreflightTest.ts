import React, { useCallback, useRef } from 'react';
import { ACTIONTYPE } from '../AppStateProvider';
import { PreflightTest, runPreflight } from 'twilio-video';

export default function usePreflightTest(dispatch: React.Dispatch<ACTIONTYPE>) {
  const preflightTestRef = useRef<PreflightTest>();
  const startPreflightTest = useCallback(() => {
    // Don't start a new preflight test if one is already running
    if (preflightTestRef.current) {
      return;
    }

    dispatch({ type: 'preflight-started' });

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = decodeURIComponent(urlParams.get('token') ?? '');
      const preflightTest = runPreflight(token);

      preflightTestRef.current = preflightTest;

      preflightTest.on('progress', (progress) => {
        dispatch({ type: 'preflight-progress', progress });
      });

      preflightTest.on('completed', (report) => {
        dispatch({ type: 'preflight-completed', report });
        dispatch({ type: 'preflight-finished' });
      });

      preflightTest.on('failed', (error) => {
        dispatch({ type: 'preflight-failed', error });
        dispatch({ type: 'preflight-finished' });
      });
      return Promise.resolve();
    } catch (error) {
      console.error('Error running the preflight test', error);
      dispatch({ type: 'preflight-token-failed', error: error as Error });
      dispatch({ type: 'preflight-finished' });
      return Promise.reject();
    }
  }, [dispatch]);

  return { startPreflightTest } as const;
}
