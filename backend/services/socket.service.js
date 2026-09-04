// backend/services/socket.service.js

const {
  getIO,
} = require("../config/socket");

// ================= SEND ORDER STATUS =================
const sendOrderStatusUpdate = (
  orderId,
  status,
  extraData = {}
) => {
  try {
    const io = getIO();

    io.to(orderId).emit(
      "orderStatusUpdated",
      {
        orderId,
        status,
        ...extraData,
      }
    );

    console.log(
      `📦 Order ${orderId} status updated: ${status}`
    );
  } catch (error) {
    console.error(
      "Socket Status Update Error:",
      error.message
    );
  }
};

// ================= SEND DELIVERY LOCATION =================
const sendDeliveryLocation =
  (
    orderId,
    latitude,
    longitude
  ) => {
    try {
      const io = getIO();

      io.to(orderId).emit(
        "deliveryLocationUpdated",
        {
          orderId,
          latitude,
          longitude,
        }
      );

      console.log(
        `📍 Delivery location updated for order ${orderId}`
      );
    } catch (error) {
      console.error(
        "Socket Location Error:",
        error.message
      );
    }
  };

// ================= SEND NEW ORDER =================
const sendNewOrder = (
  restaurantId,
  orderData
) => {
  try {
    const io = getIO();

    io.to(restaurantId).emit(
      "newOrder",
      orderData
    );

    console.log(
      `🛒 New order sent to restaurant ${restaurantId}`
    );
  } catch (error) {
    console.error(
      "Socket New Order Error:",
      error.message
    );
  }
};

// ================= SEND NOTIFICATION =================
const sendNotification = (
  userId,
  notification
) => {
  try {
    const io = getIO();

    io.to(userId).emit(
      "notification",
      notification
    );

    console.log(
      `🔔 Notification sent to user ${userId}`
    );
  } catch (error) {
    console.error(
      "Socket Notification Error:",
      error.message
    );
  }
};

// ================= SEND DRIVER ASSIGNED =================
const sendDriverAssigned =
  (
    orderId,
    driverData
  ) => {
    try {
      const io = getIO();

      io.to(orderId).emit(
        "driverAssigned",
        driverData
      );

      console.log(
        `🚴 Driver assigned for order ${orderId}`
      );
    } catch (error) {
      console.error(
        "Socket Driver Assign Error:",
        error.message
      );
    }
  };

module.exports = {
  sendOrderStatusUpdate,
  sendDeliveryLocation,
  sendNewOrder,
  sendNotification,
  sendDriverAssigned,
};