import React, { useState, useEffect, useCallback, useRef } from 'react';

// @params initialValues - initial values of the shared state
// @params callObject - the daily callObject
export const useSharedState = ({ initialValues, callObject: daily }) => {
  const stateRef = useRef(null);
  const [state, setState] = useState(initialValues);

  // function allows us to get the first participant who joined the call from the list of participants
  const findEarliestParticipant = participants => {
    // get the first timestamp among the participants list.
    let earliestTimestamp = new Date(
      Math.min.apply(
        null,
        participants.map(participant => {
          return new Date(participant.joined_at);
        }),
      ),
    );
    // returns the first joined participant, using the timestamp.
    return participants.filter(participant => {
      return (
        new Date(participant.joined_at).getTime() ===
        earliestTimestamp.getTime()
      );
    })[0];
  };

  // handling the app-message event, to check if the state is being shared.
  const handleAppMessage = useCallback(
    event => {
      switch (event.data?.message?.type) {
        // if we receive a request-shared-state message type, we send the shared-state to everyone in the call.
        case 'request-shared-state':
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
        // if we receive a set-shared-state message type then, we set the shared-state values into the local user state.
        case 'set-shared-state':
          setState(event.data.message.value);
          break;
      }
    },
    [stateRef, daily],
  );

  // whenever local user joins, we find out who is the earliest participant in the call
  // and we will request him for the shared state.
  const handleJoinedMeeting = useCallback(() => {
    // Randomize delay to increase the chance of lowering overall network traffic
    const requestDelay = 1000 + Math.ceil(2000 * Math.random());
    setTimeout(() => {
      const participants = daily.participants();
      const earlyParticipant = findEarliestParticipant(
        Object.values(participants),
      );
      daily.sendAppMessage(
        {
          message: {
            type: 'request-shared-state',
          },
        },
        earlyParticipant.user_id,
      );
    }, requestDelay);
  }, [daily]);

  useEffect(() => {
    if (daily) {
      daily.on('app-message', handleAppMessage);
      daily.on('joined-meeting', handleJoinedMeeting);
    }
  }, [daily]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // setSharedState function takes in the state values :-
  // 1. shares the state with everyone in the call.
  // 2. set the state for the local user.
  const setSharedState = useCallback(
    values => {
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
    },
    [daily],
  );

  // returns back the sharedState and the setSharedState function
  return { sharedState: state, setSharedState };
};
