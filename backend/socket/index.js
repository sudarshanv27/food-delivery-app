// backend/socket/index.js
const { Server } = require('socket.io');

let io;

// ================= INITIALIZE SOCKET.IO =================
const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: [
                'http://localhost:3000',    // Web app
                'http://localhost:3001',    // Admin panel
                'http://localhost:8081',    // Mobile app (Expo)
                'http://localhost:19000',   // Expo development
                'http://localhost:19001',   // Expo development
                'http://10.0.2.2:3000',     // Android emulator
                'http://127.0.0.1:3000'     // Localhost
            ],
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling']
    });

    // ================= SOCKET CONNECTION HANDLER =================
    io.on('connection', (socket) => {
        console.log(`🟢 Client Connected: ${socket.id}`);

        // ================= JOIN USER ROOM =================
        socket.on('join-user', (userId) => {
            if (userId) {
                socket.join(`user-${userId}`);
                console.log(`👤 User ${userId} joined room user-${userId}`);
            }
        });

        // ================= JOIN ORDER ROOM =================
        socket.on('join-order', (orderId) => {
            if (orderId) {
                socket.join(`order-${orderId}`);
                console.log(`📦 Socket ${socket.id} joined order-${orderId}`);
            }
        });

        // ================= TRACK DELIVERY =================
        socket.on('track-delivery', (orderId) => {
            if (orderId) {
                socket.join(`delivery-${orderId}`);
                console.log(`🚚 Socket ${socket.id} tracking delivery for order ${orderId}`);
            }
        });

        // ================= JOIN RESTAURANT ROOM =================
        socket.on('join-restaurant', (restaurantId) => {
            if (restaurantId) {
                socket.join(`restaurant-${restaurantId}`);
                console.log(`🍕 Socket ${socket.id} joined restaurant-${restaurantId}`);
            }
        });

        // ================= JOIN DRIVER ROOM =================
        socket.on('join-driver', (driverId) => {
            if (driverId) {
                socket.join(`driver-${driverId}`);
                console.log(`🚗 Driver ${driverId} joined room driver-${driverId}`);
            }
        });

        // ================= UPDATE DRIVER LOCATION =================
        socket.on('update-location', (data) => {
            /*
                data = {
                    orderId: "ORD123",
                    driverId: "DRV456",
                    location: {
                        lat: 12.9716,
                        lng: 77.5946
                    },
                    timestamp: "2024-01-15T10:30:00.000Z"
                }
            */
            if (data && data.orderId && data.location) {
                // Send to customer tracking this delivery
                io.to(`delivery-${data.orderId}`).emit('driver-location', {
                    orderId: data.orderId,
                    location: data.location,
                    timestamp: data.timestamp || new Date().toISOString(),
                    driverId: data.driverId
                });

                console.log(`📍 Location update for order ${data.orderId}:`, data.location);
            }
        });

        // ================= UPDATE ORDER STATUS =================
        socket.on('update-order-status', (data) => {
            /*
                data = {
                    orderId: "ORD123",
                    status: "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled",
                    message: "Optional message",
                    timestamp: "2024-01-15T10:30:00.000Z"
                }
            */
            if (data && data.orderId && data.status) {
                // Send to customer who placed the order
                io.to(`order-${data.orderId}`).emit('order-status', {
                    orderId: data.orderId,
                    status: data.status,
                    message: data.message || '',
                    timestamp: data.timestamp || new Date().toISOString()
                });

                // Also notify restaurant
                socket.emit('order-status-updated', {
                    orderId: data.orderId,
                    status: data.status,
                    timestamp: new Date().toISOString()
                });

                console.log(`📋 Order ${data.orderId} status updated to: ${data.status}`);
            }
        });

        // ================= SEND GENERAL NOTIFICATION =================
        socket.on('send-notification', (data) => {
            /*
                data = {
                    userId: "USER123",
                    title: "Order Update",
                    message: "Your order has been confirmed!",
                    type: "order" | "promo" | "system"
                }
            */
            if (data && data.userId && data.title) {
                io.to(`user-${data.userId}`).emit('notification', {
                    id: Date.now(),
                    title: data.title,
                    message: data.message || '',
                    type: data.type || 'system',
                    timestamp: new Date().toISOString(),
                    read: false
                });

                console.log(`🔔 Notification sent to user ${data.userId}: ${data.title}`);
            }
        });

        // ================= NEW ORDER CREATED =================
        socket.on('new-order', (orderData) => {
            /*
                orderData = {
                    orderId: "ORD123",
                    restaurantId: "RES456",
                    userId: "USER789",
                    total: 450,
                    status: "pending"
                }
            */
            if (orderData && orderData.restaurantId) {
                // Notify restaurant about new order
                io.to(`restaurant-${orderData.restaurantId}`).emit('new-order-received', {
                    orderId: orderData.orderId,
                    userId: orderData.userId,
                    total: orderData.total,
                    status: orderData.status,
                    timestamp: new Date().toISOString()
                });

                console.log(`🆕 New order ${orderData.orderId} created for restaurant ${orderData.restaurantId}`);
            }
        });

        // ================= ORDER ACCEPTED BY RESTAURANT =================
        socket.on('order-accepted', (data) => {
            if (data && data.orderId) {
                io.to(`order-${data.orderId}`).emit('order-accepted', {
                    orderId: data.orderId,
                    status: 'confirmed',
                    estimatedTime: data.estimatedTime || 30,
                    message: 'Your order has been confirmed by the restaurant!'
                });

                console.log(`✅ Order ${data.orderId} accepted by restaurant`);
            }
        });

        // ================= ORDER READY FOR PICKUP =================
        socket.on('order-ready', (data) => {
            if (data && data.orderId) {
                io.to(`order-${data.orderId}`).emit('order-ready', {
                    orderId: data.orderId,
                    status: 'ready_for_pickup',
                    message: 'Your order is ready for pickup by delivery partner!'
                });

                console.log(`✅ Order ${data.orderId} ready for pickup`);
            }
        });

        // ================= ORDER PICKED UP =================
        socket.on('order-picked-up', (data) => {
            if (data && data.orderId) {
                io.to(`order-${data.orderId}`).emit('order-picked', {
                    orderId: data.orderId,
                    status: 'out_for_delivery',
                    message: 'Your order is out for delivery!'
                });

                console.log(`🚚 Order ${data.orderId} picked up by delivery partner`);
            }
        });

        // ================= ORDER DELIVERED =================
        socket.on('order-delivered', (data) => {
            if (data && data.orderId) {
                io.to(`order-${data.orderId}`).emit('order-delivered', {
                    orderId: data.orderId,
                    status: 'delivered',
                    message: 'Your order has been delivered! Enjoy your meal!'
                });

                console.log(`🎉 Order ${data.orderId} delivered successfully`);
            }
        });

        // ================= TYPING INDICATOR =================
        socket.on('typing', (data) => {
            if (data && data.orderId) {
                socket.to(`order-${data.orderId}`).emit('user-typing', {
                    userId: data.userId,
                    isTyping: data.isTyping
                });
            }
        });

        // ================= DISCONNECT =================
        socket.on('disconnect', () => {
            console.log(`🔴 Client Disconnected: ${socket.id}`);
        });
    });

    console.log('✅ Socket.IO initialized successfully');
    return io;
};

// ================= GET SOCKET INSTANCE =================
const getIO = () => {
    if (!io) {
        throw new Error('❌ Socket.IO has not been initialized. Call initializeSocket first.');
    }
    return io;
};

// ================= EMIT TO USER =================
const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user-${userId}`).emit(event, data);
    }
};

// ================= EMIT TO ORDER =================
const emitToOrder = (orderId, event, data) => {
    if (io) {
        io.to(`order-${orderId}`).emit(event, data);
    }
};

// ================= EMIT TO RESTAURANT =================
const emitToRestaurant = (restaurantId, event, data) => {
    if (io) {
        io.to(`restaurant-${restaurantId}`).emit(event, data);
    }
};

// ================= EMIT TO DRIVER =================
const emitToDriver = (driverId, event, data) => {
    if (io) {
        io.to(`driver-${driverId}`).emit(event, data);
    }
};

// ================= BROADCAST TO ALL =================
const broadcastToAll = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};

// ================= EXPORTS =================
module.exports = {
    initializeSocket,
    getIO,
    emitToUser,
    emitToOrder,
    emitToRestaurant,
    emitToDriver,
    broadcastToAll
};