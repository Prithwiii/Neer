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
    <div>
      <h2>Incoming Intercom Call</h2>

      <p>
        {call.staffName} is calling you.
      </p>

      <button
        onClick={() => setAccepted(true)}
      >
        Accept
      </button>

      <button
        onClick={onClose}
      >
        Decline
      </button>
    </div>
  );
};

export default IncomingIntercomCall;