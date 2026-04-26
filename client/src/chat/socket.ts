import { io, Socket } from "socket.io-client";

// TODO: Update this URL when deploying the backend to AWS
const BACKEND_URL = "http://localhost:3001";

let socket: Socket | null = null;

/**
 * Returns the singleton SocketIO client, creating and connecting it on first call.
 */
const getSocket = (): Socket => {
  if (socket === null) {
    socket = io(BACKEND_URL);
  }
  return socket;
};

/**
 * Disconnects and destroys the singleton SocketIO client instance.
 */
const disconnectSocket = (): void => {
  if (socket !== null) {
    socket.disconnect();
    socket = null;
  }
};

export { getSocket, disconnectSocket };
