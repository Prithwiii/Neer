import { LiveKitRoom, RoomAudioRenderer, 
         useParticipants, StartAudio, } from "@livekit/components-react";

import "@livekit/components-styles";

const CallContent = ({onEndCall}) => {
  const participants = useParticipants();

  console.log("LiveKit participants:", participants);

  return (
    <>
      <RoomAudioRenderer/>
      <StartAudio label = "Enable Call Audio"/>
      <div>
        <h2>Intercom Call</h2>

        <p>
          {participants.length > 1
          ? "connected"
          : "waiting for the other user..."}
        </p>

        <p>
          Participants: {participants.length}
        </p>

        <button onClick={onEndCall}>
          End Call
        </button>

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