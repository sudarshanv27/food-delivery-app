// backend/controllers/delivery.controller.js

const { getIO } = require("../config/socket");

const {
    pool,
} = require("../config/database");

// ================= ACCEPT ORDER =================
const acceptOrder = async (
    req,
    res
) => {
    try {
        const {
            orderId,
            deliveryPartnerId,
        } = req.body;

        // ================= VALIDATION =================
        if (
            !orderId ||
            !deliveryPartnerId
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Order ID and Delivery Partner ID are required",
            });
        }

        // ================= CHECK ORDER =================
        const orderResult =
            await pool.query(
                `
        SELECT *
        FROM orders
        WHERE order_id = $1
        `,
                [orderId]
            );

        if (
            orderResult.rows.length === 0
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Order not found",
            });
        }

        // ================= UPDATE ORDER =================
        await pool.query(
            `
      UPDATE orders
      SET
        delivery_partner_id = $1,
        order_status = 'accepted'
      WHERE order_id = $2
      `,
            [
                deliveryPartnerId,
                orderId,
            ]
        );

        // ================= SOCKET EVENT =================
        const io = getIO();

        io.to(orderId).emit(
            "orderAccepted",
            {
                orderId,
                deliveryPartnerId,
                status: "accepted",
            }
        );

        // ================= RESPONSE =================
        return res.status(200).json({
            success: true,
            message:
                "Order accepted successfully",
        });
    } catch (error) {
        console.error(
            "Accept Order Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Internal server error",
        });
    }
};

// ================= UPDATE DELIVERY STATUS =================
const updateDeliveryStatus =
    async (req, res) => {
        try {
            const {
                orderId,
                status,
            } = req.body;

            // ================= VALIDATION =================
            if (
                !orderId ||
                !status
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Order ID and status are required",
                });
            }

            // ================= VALID STATUSES =================
            const validStatuses = [
                "accepted",
                "preparing",
                "picked_up",
                "on_the_way",
                "delivered",
            ];

            if (
                !validStatuses.includes(
                    status
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid order status",
                });
            }

            // ================= UPDATE DATABASE =================
            await pool.query(
                `
        UPDATE orders
        SET order_status = $1
        WHERE order_id = $2
        `,
                [status, orderId]
            );

            // ================= SOCKET UPDATE =================
            const io = getIO();

            io.to(orderId).emit(
                "orderStatusUpdated",
                {
                    orderId,
                    status,
                }
            );

            // ================= RESPONSE =================
            return res.status(200).json({
                success: true,
                message:
                    "Delivery status updated",
            });
        } catch (error) {
            console.error(
                "Delivery Status Error:",
                error.message
            );

            return res.status(500).json({
                success: false,
                message:
                    "Internal server error",
            });
        }
    };

// ================= UPDATE DELIVERY LOCATION =================
const updateLocation =
    async (req, res) => {
        try {
            const {
                orderId,
                latitude,
                longitude,
            } = req.body;

            // ================= VALIDATION =================
            if (
                !orderId ||
                !latitude ||
                !longitude
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Order ID, latitude and longitude are required",
                });
            }

            // ================= SOCKET LOCATION UPDATE =================
            const io = getIO();

            io.to(orderId).emit(
                "deliveryLocationUpdated",
                {
                    orderId,
                    latitude,
                    longitude,
                }
            );

            // ================= RESPONSE =================
            return res.status(200).json({
                success: true,
                message:
                    "Location updated successfully",
            });
        } catch (error) {
            console.error(
                "Location Update Error:",
                error.message
            );

            return res.status(500).json({
                success: false,
                message:
                    "Internal server error",
            });
        }
    };

// ================= GET DELIVERY ORDERS =================
const getDeliveryOrders =
    async (req, res) => {
        try {
            const { deliveryPartnerId } =
                req.params;

            const result =
                await pool.query(
                    `
        SELECT *
        FROM orders
        WHERE delivery_partner_id = $1
        ORDER BY created_at DESC
        `,
                    [deliveryPartnerId]
                );

            return res.status(200).json({
                success: true,
                orders: result.rows,
            });
        } catch (error) {
            console.error(
                "Get Delivery Orders Error:",
                error.message
            );

            return res.status(500).json({
                success: false,
                message:
                    "Internal server error",
            });
        }
    };

module.exports = {
    acceptOrder,
    updateDeliveryStatus,
    updateLocation,
    getDeliveryOrders,
};