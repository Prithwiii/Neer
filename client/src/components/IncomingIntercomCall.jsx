import { useState } from "react";

import IntercomCall from "./IntercomCall";

const IncomingIntercomCall = ({ call, onClose }) => {
  const [accepted, setAccepted] = useState(false);

  if (!call) {
    return null;
  }

  if (accepted) {
    return (
      <IntercomCall
        callData={{
          roomName: call.roomName,
          token: call.token,
          livekitUrl: call.livekitUrl,
        }}
        onEndCall={onClose}
      />
    );
  }

  return (
    <div className="intercom-overlay" role="dialog" aria-modal="true" aria-labelledby="incoming-call-title">
      <div className="intercom-call-card incoming-call-card">
        <span className="intercom-call-signal" aria-hidden="true">◉</span>
        <p className="intercom-call-kicker">Incoming intercom</p>
        <h2 id="incoming-call-title">Someone is calling</h2>

        <p className="intercom-call-description">
          <strong>{call.staffName}</strong> is calling you from the building desk.
        </p>

        <div className="intercom-call-actions">
          <button type="button" onClick={() => setAccepted(true)}>
            Accept call
          </button>

          <button type="button" className="secondary" onClick={onClose}>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingIntercomCall;