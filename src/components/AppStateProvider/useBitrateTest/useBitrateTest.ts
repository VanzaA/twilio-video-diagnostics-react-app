import { useCallback, useRef } from 'react';
import { testMediaConnectionBitrate, MediaConnectionBitrateTest } from '@twilio/rtc-diagnostics';
import { ACTIONTYPE } from '../AppStateProvider';
import { Buffer } from 'buffer';

export default function useBitrateTest(dispatch: React.Dispatch<ACTIONTYPE>) {
  const bitrateTestRef = useRef<MediaConnectionBitrateTest>();
  const startBitrateTest = useCallback(() => {
    //Don't start a new bitrate test if one is already running:
    if (bitrateTestRef.current) {
      return;
    }

    dispatch({ type: 'bitrate-test-started' });

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const buff = Buffer.from(decodeURIComponent(urlParams.get('iceServers') ?? ''), 'base64');
      console.log(buff.toString('ascii'));

      const iceServers = JSON.parse(buff.toString('ascii'));

      const bitrateTest = testMediaConnectionBitrate({ iceServers: iceServers });

      bitrateTestRef.current = bitrateTest;

      bitrateTest.on(MediaConnectionBitrateTest.Events.Bitrate, (bitrate) => {
        dispatch({ type: 'set-bitrate', bitrate });
      });

      bitrateTest.on(MediaConnectionBitrateTest.Events.Error, (error) => {
        dispatch({ type: 'set-bitrate-test-error', error });
        dispatch({ type: 'bitrate-test-finished' });
      });

      bitrateTest.on(MediaConnectionBitrateTest.Events.End, (report) => {
        dispatch({ type: 'set-bitrate-test-report', report });
        dispatch({ type: 'bitrate-test-finished' });
      });

      setTimeout(() => {
        bitrateTest.stop();
      }, 15000);

      return Promise.resolve();
    } catch (error) {
      console.error('Error running the bitrate test', error);
      dispatch({ type: 'set-bitrate-test-error', error: error as Error });
      dispatch({ type: 'bitrate-test-finished' });
      return Promise.reject();
    }
  }, [dispatch]);

  return { startBitrateTest } as const;
}
