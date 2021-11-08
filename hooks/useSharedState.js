import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

// @params initialValues - initial values of the shared state
// @params callObject - the daily callObject
export const useSharedState = ({ initialValues, callObject: daily }) => {
  const stateRef = useRef(null);
  const [state, setState] = useState(initialValues);

  // function allows us to get the earliest participants from the list of participants
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

  // whenever a participant joins, we get the participants list
  // and find out who is the earliest participant in the call
  // and shares his state value to everyone in the call.
  const handleParticipantJoined = useCallback(
    () => {
      const participants = daily.participants();
      const earlyParticipant = findEarliestParticipant(
        Object.values(participants),
      );
      if (earlyParticipant.local) {
        // have to wait for a sec as the participant-joined event may trigger before the local participant joins in.
        // https://docs.daily.co/reference/daily-js/events/participant-events#participant-joined
        // from the doc - this event may arrive for a remote participant before the local joined-meeting event fires.
        setTimeout(() => {
          daily.sendAppMessage(
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
    [stateRef, daily],
  );

  // handling the app-message event, to check if the state is being shared.
  const handleAppMessage = useCallback(event => {
    if (event.data?.message?.type === 'set-shared-state') {
      setState(event.data.message.value);
    }
  }, []);

  useEffect(() => {
    if (daily) {
      daily.on('app-message', handleAppMessage);
      daily.on('participant-joined', handleParticipantJoined);
    }
  }, [daily]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // setSharedState function takes in the state values :-
  // 1. set the state for the local user.
  // 2. share the state with everyone in the call.
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
