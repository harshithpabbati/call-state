import React, { useState, useEffect, useCallback, useRef } from 'react';

// @params callObject - the daily callObject
// @params initialValues - initial values of the shared state
export const useSharedState = ({ callObject: daily, initialValues = {} }) => {
  const stateRef = useRef(null);

  // to check if the user already has state history, other than the initial values.
  const hasStateHistoryRef = useRef(false);

  const [state, setState] = useState({
    sharedState: initialValues,
    setAt: new Date(),
  });

  // handling the app-message event, to check if the state is being shared.
  const handleAppMessage = useCallback(
    event => {
      switch (event.data?.message?.type) {
        // if we receive a request-shared-state message type, we check if the user has any previous state,
        // if yes, we will send the shared-state to everyone in the call.
        case 'request-shared-state':
          if (!hasStateHistoryRef.current) return;
          daily.sendAppMessage(
            {
              message: {
                type: 'set-shared-state',
                value: stateRef.current,
              },
            },
            '*',
          );
          break;
        // if we receive a set-shared-state message type then, we check the state timestamp with the local one and
        // we set the latest shared-state values into the local state.
        case 'set-shared-state':
          if (
            hasStateHistoryRef.current &&
            stateRef.current.setAt > event.data.message.value.setAt
          )
            return;
          hasStateHistoryRef.current = true;
          setState(event.data.message.value);
          break;
      }
    },
    [stateRef, daily],
  );

  // whenever local user joins, we request the state from everyone in the call.
  const handleJoinedMeeting = useCallback(() => {
    const interval = setInterval(() => {
      if (hasStateHistoryRef.current) clearInterval(interval);
      daily.sendAppMessage(
        {
          message: {
            type: 'request-shared-state',
          },
        },
        '*',
      );
    }, 2000);
  }, [daily, hasStateHistoryRef]);

  useEffect(() => {
    if (!daily) return;
    daily.on('app-message', handleAppMessage);
    daily.on('joined-meeting', handleJoinedMeeting);
    return () => {
      daily.off('app-message', handleAppMessage);
      daily.off('joined-meeting', handleJoinedMeeting);
    }
  }, [daily, handleAppMessage, handleJoinedMeeting]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // setSharedState function takes in the state values :-
  // 1. shares the state with everyone in the call.
  // 2. set the state for the local user.
  const setSharedState = useCallback(
    values => {
      const objState = { sharedState: values, setAt: new Date() };
      daily.sendAppMessage(
        {
          message: {
            type: 'set-shared-state',
            value: objState,
          },
        },
        '*',
      );
      setState({ ...state, ...objState });
    },
    [daily, state],
  );

  // returns back the sharedState and the setSharedState function
  return { sharedState: state.sharedState, setSharedState };
};
