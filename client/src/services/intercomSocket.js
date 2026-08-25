import {io} from "socket.io-client";
import API_URL from "../config/api";

const SOCKET_URL = API_URL;

export const socket = io(SOCKET_URL);

export const registerIntercomUser = (userId) => {
    socket.emit("register", userId);
};

export const startIntercomCall = async (residentEmail) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/api/intercom/call`, 
        {    
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ residentEmail }),

        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error( data.message || "Failed to start call" );
    }

    return data;
     
}