import {AccessToken} from "livekit-server-sdk";

export const generateLiveKitToke = async ({
    roomName,
    identity,
    name,
}) => {
    const token = new AccessToken(
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,
        {
            identity,
            name,
            ttl: "1h",
        });
    token.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
    });
    return await token.toJwt();
};