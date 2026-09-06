import { LiveKitRoom, RoomAudioRenderer, useParticipants, StartAudio } from "@livekit/components-react";

import "@livekit/components-styles";

const CallContent = ({onEndCall}) => {
  const participants = useParticipants();

  return (
    <>
      <RoomAudioRenderer />
      <StartAudio label="Enable call audio" />
      <div className="intercom-overlay active-call-overlay" role="dialog" aria-modal="true" aria-labelledby="active-call-title">
        <div className="intercom-call-card active-call-card">
          <span className="intercom-call-signal is-live" aria-hidden="true">●</span>
          <p className="intercom-call-kicker">Live intercom</p>
          <h2 id="active-call-title">Intercom call</h2>

          <p className="intercom-call-status">
            <span className="intercom-status-dot" aria-hidden="true" />
            {participants.length > 1 ? "Connected" : "Waiting for the other user..."}
          </p>

          <p className="intercom-participant-count">{participants.length} participant{participants.length === 1 ? "" : "s"}</p>

          <button type="button" className="intercom-end-call" onClick={onEndCall}>
            End call
          </button>
        </div>

      </div>
    </>
  );
};

const IntercomCall = ({ callData, onEndCall }) => {
  if (!callData) {
    return null;
  }

  return (
    <LiveKitRoom
      token={callData.token}
      serverUrl={callData.livekitUrl}
      connect={true}
      audio={true}
      video={false}
      onDisconnected={onEndCall}
    >
      <CallContent onEndCall={onEndCall}/>
    </LiveKitRoom>
  );
};

export default IntercomCall;