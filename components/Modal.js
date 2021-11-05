import * as React from "react";

const Modal = ({ isVisible, hideModal }) => {
  return isVisible
    ? (
      <>
        <div className="modal">
          <div className="header">
            <h1 className="title">Modal</h1>
            <span className="description">
              Here is the modal
            </span>
          </div>
          <button onClick={hideModal} className="button">
            Go to event
          </button>
          <style jsx>{`
            .modal {
              position: fixed;
              z-index: 3000;
              display: flex;
              justify-content: center;
              outline: 0;
              top: 25%;
              left: 25%;
              width: 100%;
              align-items: center;
              background: white;
              border-radius: 0.25rem;
              flex-direction: column;
              margin: 1.875rem;
              max-width: 500px;
              padding: 1em;
            }
            .header {
              align-items: center;
              display: flex;
              flex-direction: column;
              padding: 1.875rem 0.9375rem 1.875rem 0.9375rem;
            }
            .description {
              text-align: center;
            }
            .button {
              cursor: pointer;
              font-weight: bold;
              padding: 0.9375rem;
              width: 100%;
            }
          `}
          </style>
        </div>
      </>
    ) : null;
};

export default Modal;
