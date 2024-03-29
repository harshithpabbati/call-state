import React, { useEffect, useRef, useState, useCallback } from 'react';
import DailyIframe from '@daily-co/daily-js';

const CALL_OPTIONS = {
  showLeaveButton: true,
  iframeStyle: {
    position: 'fixed',
    border: 0,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
};

export const useCallState = () => {
  const callRef = useRef(null);
  const url = 'https://harshith.daily.co/4aafc8uvLt7vzu6Sh9gu';

  const [daily, setDaily] = useState(null);

  const leave = useCallback(() => {
    daily.destroy();
    setDaily(null);
  }, []);

  const joinCall = useCallback(async () => {
    const frame = DailyIframe.createFrame(callRef?.current, CALL_OPTIONS);
    setDaily(frame);
    await frame.join({ url });
  }, []);

  useEffect(() => {
    if (daily) return;
    joinCall();
  }, []);

  return { callRef, daily, leave };
};
