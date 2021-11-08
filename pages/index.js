import React, { useEffect } from 'react';
import Modal from '../components/Modal';
import { useCallState } from '../hooks/useCallState';
import { useSharedState } from '../hooks/useSharedState';

const Home = () => {
  const { callRef, daily, leave } = useCallState();
  const { sharedState, setSharedState } = useSharedState(
    {
      initialValues: { isVisible: false, showToggle: false },
      callObject: daily,
    },
  );

  const handleToggle = () =>
    setSharedState({ ...sharedState, isVisible: !sharedState.isVisible });

  useEffect(() => {
    const leaveCall = () => {
      setSharedState({ ...sharedState, showToggle: false });
      leave();
    };

    if (daily) {
      daily.on('joined-meeting', () =>
        setSharedState({ ...sharedState, showToggle: true }),
      );
      daily.on('left-meeting', leaveCall);
    }
  }, [daily]);

  const hideModal = () => setSharedState({ ...sharedState, isVisible: false });

  return (
    <div>
      <button
        className={`toggle-button ${!sharedState.showToggle && 'hidden'}`}
        onClick={handleToggle}
      >
        Toggle Button
      </button>
      <div ref={callRef} className="call" />
      <Modal isVisible={sharedState.isVisible} hideModal={hideModal} />
      <style jsx>
        {`
          .toggle-button {
            padding: 10px;
            z-index: 3000;
            position: fixed;
            bottom: 1em;
            right: 5em;
          }
          .hidden {
            visibility: hidden;
            display: none;
          }
          .center {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
        `}
      </style>
    </div>
  );
};

export default Home;
