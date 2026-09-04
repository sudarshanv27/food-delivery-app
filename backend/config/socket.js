// backend/config/socket.js

const { Server } =
    require("socket.io");

let io;

// ================= INITIALIZE SOCKET =================
const initializeSocket = (
    server
) => {
    io = new Server(server, {
        cors: {
            origin: "*",

            methods: [
                "GET",
                "POST",
            ],
        },
    });

    // ================= CONNECTION =================
    io.on(
        "connection",
        (socket) => {
            console.log(
                `✅ User Connected: ${socket.id}`
            );

            // ================= JOIN ROOM =================
            socket.on(
                "joinRoom",
                (roomId) => {
                    socket.join(roomId);

                    console.log(
                        `📦 Joined Room: ${roomId}`
                    );
                }
            );

            // ================= DISCONNECT =================
            socket.on(
                "disconnect",
                () => {
                    console.log(
                        `❌ User Disconnected: ${socket.id}`
                    );
                }
            );
        }
    );

    return io;
};

// ================= GET IO =================
const getIO = () => {
    if (!io) {
        throw new Error(
            "Socket.IO not initialized"
        );
    }

    return io;
};

module.exports = {
    initializeSocket,
    getIO,
};