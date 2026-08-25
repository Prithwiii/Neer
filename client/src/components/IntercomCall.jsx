import { LiveKitRoom, RoomAudioRenderer, } from "@livekit/components-react";

import "@livekit/components-styles";

const IntercomCall = ({ callData }) => {
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
    >
      <RoomAudioRenderer />

      <div>
        <h2>Intercom Call</h2>
        <p>Call active</p>
      </div>
    </LiveKitRoom>
  );
};

export default IntercomCall;