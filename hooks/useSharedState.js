import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
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

export const useSharedState = ({ initialValues }) => {
  const url = 'https://harshith.daily.co/4aafc8uvLt7vzu6Sh9gu';
  const callRef = useRef(null);
  const stateRef = useRef(null);

  const [daily, setDaily] = useState(null);
  const [state, setState] = useState(initialValues);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const handleAppMessage = useCallback(event => {
    if (event.data?.message?.type === 'set-shared-state') {
      setState(event.data.message.value);
    }
  }, []);

  const findEarliestParticipant = participants => {
    let earliestTimestamp = new Date(
      Math.min.apply(
        null,
        participants.map(participant => {
          return new Date(participant.joined_at);
        }),
      ),
    );
    return participants.filter(participant => {
      return (
        new Date(participant.joined_at).getTime() ===
        earliestTimestamp.getTime()
      );
    })[0];
  };

  const handleParticipantJoined = useCallback(
    frame => {
      const participants = frame.participants();
      const earlyParticipant = findEarliestParticipant(
        Object.values(participants),
      );
      if (earlyParticipant.local) {
        setTimeout(() => {
          frame.sendAppMessage(
            {
              message: {
                type: 'set-shared-state',
                value: stateRef.current,
              },
            },
            '*',
          );
        }, 1000);
      }
    },
    [stateRef],
  );

  useEffect(() => {
    if (daily) return;

    const frame = DailyIframe.createFrame(callRef?.current, CALL_OPTIONS);
    setDaily(frame);
    frame.join({ url });

    frame.on('app-message', handleAppMessage);
    frame.on('participant-joined', () => handleParticipantJoined(frame));
  }, []);

  const leave = useCallback(() => {
    daily.destroy();
    setDaily(null);
  }, []);

  const setSharedState = useCallback(
    values => {
      if (daily) {
        daily.sendAppMessage(
          {
            message: {
              type: 'set-shared-state',
              value: values,
            },
          },
          '*',
        );
        setState(values);
      }
    },
    [daily],
  );

  return { callRef, daily, leave, sharedState: state, setSharedState };
};
