import React, {useCallback, useEffect, useRef, useState} from 'react';
import Modal from "../components/Modal";
import DailyIframe from "@daily-co/daily-js";

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

const Home = () => {
  const callRef = useRef(null);
  const [callFrame, setCallFrame] = useState(null);
  const [showToggle, setShowToggle] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleToggle = () => {
    callFrame.sendAppMessage({
      message: {
        type: 'set-overlay-state',
        value: !isVisible
      }
    }, '*');
    setIsVisible(!isVisible);
  };

  const findEarliestParticipant = (participants) => {
    let earliestTimestamp = new Date(Math.min.apply(null, participants.map(participant => {
      return new Date(participant.joined_at);
    })));
    return participants.filter(participant => {
      return new Date(participant.joined_at).getTime() === earliestTimestamp.getTime();
    })[0];
  };

  const getOverlayVisibility = () => {
    const modal = document.getElementsByClassName("modal");
    return modal.length > 0
  };

  const participantJoined = useCallback((newCallFrame) => {
    const participants = newCallFrame.participants();
    const earlyParticipant = findEarliestParticipant(Object.values(participants));
    if (earlyParticipant.local) {
      setTimeout(() => {
        newCallFrame.sendAppMessage({
          message: {
            type: 'set-overlay-state',
            value: getOverlayVisibility()
          }
        }, '*');
      }, 1500);
    }
  }, []);

  const handleAppMessageEvent = useCallback((event) => {
    if (event.data.message && event.data.message.type) {
      if (event.data.message?.type === 'set-overlay-state')
        setIsVisible(event.data.message.value);
    }
  }, []);

  const joinCall = useCallback(() => {
    const leaveCall = () => {
      setCallFrame(null);
      setShowToggle(false);
      callFrame.destroy();
    };
    const newCallFrame = DailyIframe.createFrame(
      callRef?.current,
      CALL_OPTIONS,
    );
    setCallFrame(newCallFrame);
    newCallFrame.join({ url: 'https://harshith.daily.co/4aafc8uvLt7vzu6Sh9gu' });
    newCallFrame.on('joined-meeting', () => setShowToggle(true));
    newCallFrame.on('participant-joined', () => participantJoined(newCallFrame));
    newCallFrame.on('app-message', handleAppMessageEvent);
    newCallFrame.on('left-meeting', leaveCall);
  }, [callFrame, handleAppMessageEvent, participantJoined]);

  useEffect(() => {
    if (callFrame) return;

    joinCall();
  }, [callFrame, joinCall]);

  return (
    <div>
      <button
        className={`toggle-button ${!showToggle && 'hidden'}`}
        onClick={handleToggle}
      >
        Toggle Button
      </button>
      <div ref={callRef} className="call" />
      <Modal isVisible={isVisible} hideModal={setIsVisible} />
      <style jsx>{`
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
  )
};

export default Home;
