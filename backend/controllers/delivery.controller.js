const { pool } = require('../config/database');
const { getIO } = require('../config/socket');

// ============================================================
// HELPERS
// ============================================================

const DELIVERY_USER_TYPE = 'delivery';

const DELIVERY_STATUS_MAP = {
    accepted: 'confirmed',
    picked_up: 'out_for_delivery',
    on_the_way: 'out_for_delivery',
    delivered: 'delivered'
};

async function getDeliveryPartner(userId) {
    const result = await pool.query(
        `
        SELECT
            dp.*,
            u.full_name,
            u.email,
            u.phone,
            u.avatar_url,
            u.is_active,
            u.is_verified
        FROM delivery_partners dp
        INNER JOIN users u
            ON u.user_id = dp.user_id
        WHERE dp.user_id = $1
          AND u.user_type = $2
        `,
        [userId, DELIVERY_USER_TYPE]
    );

    return result.rows[0] || null;
}

function getAuthenticatedUserId(req) {
    return req.user?.userId || req.user?.user_id || req.user?.id;
}

// ============================================================
// GET MY DELIVERY PARTNER PROFILE
// ============================================================

const getMyProfile = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const partner = await getDeliveryPartner(userId);

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: 'Delivery partner profile not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Delivery partner profile fetched successfully',
            data: partner
        });
    } catch (error) {
        console.error('Get Delivery Partner Profile Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ============================================================
// UPDATE MY PROFILE
// ============================================================

const updateMyProfile = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const {
            vehicle_type,
            vehicle_number,
            license_number
        } = req.body;

        const result = await pool.query(
            `
            UPDATE delivery_partners
            SET
                vehicle_type = COALESCE($1, vehicle_type),
                vehicle_number = COALESCE($2, vehicle_number),
                license_number = COALESCE($3, license_number),
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $4
            RETURNING *
            `,
            [
                vehicle_type ?? null,
                vehicle_number ?? null,
                license_number ?? null,
                userId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Delivery partner profile not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Delivery partner profile updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update Delivery Partner Profile Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ============================================================
// SET ONLINE / OFFLINE
// ============================================================

const updateOnlineStatus = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);
        const { is_online } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (typeof is_online !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'is_online must be true or false'
            });
        }

        const result = await pool.query(
            `
            UPDATE delivery_partners
            SET
                is_online = $1,
                is_available = CASE
                    WHEN $1 = false THEN false
                    ELSE is_available
                END,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $2
            RETURNING *
            `,
            [is_online, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Delivery partner profile not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: is_online
                ? 'Delivery partner is now online'
                : 'Delivery partner is now offline',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update Online Status Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ============================================================
// SET AVAILABILITY
// ============================================================

const updateAvailability = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);
        const { is_available } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (typeof is_available !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'is_available must be true or false'
            });
        }

        const result = await pool.query(
            `
            UPDATE delivery_partners
            SET
                is_available = CASE
                    WHEN is_online = true THEN $1
                    ELSE false
                END,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $2
            RETURNING *
            `,
            [is_available, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Delivery partner profile not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Availability updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update Availability Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ============================================================
// GET AVAILABLE ORDERS
// ============================================================

const getAvailableOrders = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const partner = await getDeliveryPartner(userId);

        if (!partner) {
            return res.status(403).json({
                success: false,
                message: 'Delivery partner profile not found'
            });
        }

        if (
            !partner.is_online ||
            !partner.is_available ||
            partner.verification_status !== 'verified'
        ) {
            return res.status(200).json({
                success: true,
                message: 'Delivery partner is not available for new orders',
                data: []
            });
        }

        const result = await pool.query(
            `
            SELECT
                o.order_id,
                o.order_number,
                o.restaurant_id,
                o.restaurant_name,
                o.user_id AS customer_id,
                u.full_name AS customer_name,
                u.phone AS customer_phone,
                o.subtotal,
                o.delivery_fee,
                o.tax_amount,
                o.total_amount,
                o.delivery_address,
                o.special_instructions,
                o.estimated_delivery_time,
                o.created_at
            FROM orders o
            INNER JOIN users u
                ON u.user_id = o.user_id
            WHERE o.order_status = 'ready_for_delivery'
              AND o.delivery_partner_id IS NULL
              AND o.payment_status <> 'failed'
            ORDER BY o.created_at ASC
            `
        );

        return res.status(200).json({
            success: true,
            message: 'Available delivery orders fetched successfully',
            data: result.rows
        });
    } catch (error) {
        console.error('Get Available Orders Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ============================================================
// ACCEPT ORDER
// ============================================================

const acceptOrder = async (req, res) => {
    const client = await pool.connect();

    try {
        const userId = getAuthenticatedUserId(req);
        const orderId = req.params.orderId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        const partner = await getDeliveryPartner(userId);

        if (!partner) {
            return res.status(403).json({
                success: false,
                message: 'Delivery partner profile not found'
            });
        }

        if (
            !partner.is_online ||
            !partner.is_available ||
            partner.verification_status !== 'verified'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Delivery partner is not available'
            });
        }

        await client.query('BEGIN');

        const orderResult = await client.query(
            `
            SELECT
                order_id,
                order_number,
                restaurant_id,
                restaurant_name,
                order_status,
                delivery_partner_id
            FROM orders
            WHERE order_id = $1
            FOR UPDATE
            `,
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const order = orderResult.rows[0];

        if (order.order_status !== 'ready_for_delivery') {
            await client.query('ROLLBACK');

            return res.status(409).json({
                success: false,
                message: `Order cannot be accepted while status is '${order.order_status}'`
            });
        }

        if (order.delivery_partner_id) {
            await client.query('ROLLBACK');

            return res.status(409).json({
                success: false,
                message: 'Order has already been assigned to a delivery partner'
            });
        }

        const updatedOrderResult = await client.query(
            `
            UPDATE orders
            SET
                delivery_partner_id = $1,
                order_status = 'out_for_delivery',
                updated_at = CURRENT_TIMESTAMP
            WHERE order_id = $2
            RETURNING
                order_id,
                order_number,
                delivery_partner_id,
                order_status,
                updated_at
            `,
            [userId, orderId]
        );

        await client.query(
            `
            UPDATE delivery_partners
            SET
                is_available = false,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $1
            `,
            [userId]
        );

        await client.query(
            `
            INSERT INTO delivery_tracking (
                order_id,
                delivery_partner_id,
                status
            )
            VALUES ($1, $2, 'out_for_delivery')
            `,
            [orderId, userId]
        );

        await client.query('COMMIT');

        const updatedOrder = updatedOrderResult.rows[0];

        try {
            const io = getIO();

            io.to(orderId).emit('orderAccepted', {
                orderId,
                deliveryPartnerId: userId,
                status: 'out_for_delivery'
            });

            io.to(orderId).emit('orderStatusUpdated', {
                orderId,
                status: 'out_for_delivery'
            });
        } catch (socketError) {
            console.error('Socket notification error:', socketError.message);
        }

        return res.status(200).json({
            success: true,
            message: 'Order accepted successfully',
            data: updatedOrder
        });
    } catch (error) {
        await client.query('ROLLBACK').catch(() => {});

        console.error('Accept Order Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    } finally {
        client.release();
    }
};

// ============================================================
// UPDATE DELIVERY STATUS
// ============================================================

const updateDeliveryStatus = async (req, res) => {
    const client = await pool.connect();

    try {
        const userId = getAuthenticatedUserId(req);
        const orderId = req.params.orderId;
        const { status } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!orderId || !status) {
            return res.status(400).json({
                success: false,
                message: 'Order ID and status are required'
            });
        }

        const validStatuses = [
            'accepted',
            'picked_up',
            'on_the_way',
            'delivered'
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid delivery status'
            });
        }

        const partner = await getDeliveryPartner(userId);

        if (!partner) {
            return res.status(403).json({
                success: false,
                message: 'Delivery partner profile not found'
            });
        }

        await client.query('BEGIN');

        const orderResult = await client.query(
            `
            SELECT
                order_id,
                order_number,
                delivery_partner_id,
                order_status
            FROM orders
            WHERE order_id = $1
            FOR UPDATE
            `,
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const order = orderResult.rows[0];

        if (order.delivery_partner_id !== userId) {
            await client.query('ROLLBACK');

            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this order'
            });
        }

        const nextOrderStatus = DELIVERY_STATUS_MAP[status];

        if (!nextOrderStatus) {
            await client.query('ROLLBACK');

            return res.status(400).json({
                success: false,
                message: 'Unable to map delivery status'
            });
        }

        const updatedOrderResult = await client.query(
            `
            UPDATE orders
            SET
                order_status = $1::varchar,
                delivered_at = CASE
                    WHEN $1::varchar = 'delivered' THEN CURRENT_TIMESTAMP
                    ELSE delivered_at
                END,
                actual_delivery_time = CASE
                    WHEN $1::varchar = 'delivered' THEN CURRENT_TIMESTAMP
                    ELSE actual_delivery_time
                END,
                updated_at = CURRENT_TIMESTAMP
            WHERE order_id = $2
            RETURNING
                order_id,
                order_number,
                delivery_partner_id,
                order_status,
                delivered_at,
                actual_delivery_time,
                updated_at
            `,
            [nextOrderStatus, orderId]
        );

        await client.query(
            `
            INSERT INTO delivery_tracking (
                order_id,
                delivery_partner_id,
                status
            )
            VALUES ($1, $2, $3)
            `,
            [orderId, userId, nextOrderStatus]
        );

        if (status === 'delivered') {
            await client.query(
                `
                UPDATE delivery_partners
                SET
                    is_available = CASE
                        WHEN is_online = true THEN true
                        ELSE false
                    END,
                    total_deliveries = total_deliveries + 1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $1
                `,
                [userId]
            );
        }

        await client.query('COMMIT');

        const updatedOrder = updatedOrderResult.rows[0];

        try {
            const io = getIO();

            io.to(orderId).emit('orderStatusUpdated', {
                orderId,
                status: nextOrderStatus
            });
        } catch (socketError) {
            console.error('Socket notification error:', socketError.message);
        }

        return res.status(200).json({
            success: true,
            message: 'Delivery status updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        await client.query('ROLLBACK').catch(() => {});

        console.error('Update Delivery Status Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    } finally {
        client.release();
    }
};

// ============================================================
// UPDATE CURRENT LOCATION
// ============================================================

const updateLocation = async (req, res) => {
    const client = await pool.connect();

    try {
        const userId = getAuthenticatedUserId(req);
        const { orderId, latitude, longitude } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (
            !orderId ||
            latitude === undefined ||
            longitude === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: 'Order ID, latitude and longitude are required'
            });
        }

        const lat = Number(latitude);
        const lng = Number(longitude);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat < -90 ||
            lat > 90 ||
            lng < -180 ||
            lng > 180
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid latitude or longitude'
            });
        }

        const partner = await getDeliveryPartner(userId);

        if (!partner) {
            return res.status(403).json({
                success: false,
                message: 'Delivery partner profile not found'
            });
        }

        await client.query('BEGIN');

        const orderResult = await client.query(
            `
            SELECT
                order_id,
                delivery_partner_id,
                order_status
            FROM orders
            WHERE order_id = $1
            FOR UPDATE
            `,
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const order = orderResult.rows[0];

        if (order.delivery_partner_id !== userId) {
            await client.query('ROLLBACK');

            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this order'
            });
        }

        if (order.order_status === 'delivered') {
            await client.query('ROLLBACK');

            return res.status(409).json({
                success: false,
                message: 'Cannot update location for a delivered order'
            });
        }

        await client.query(
            `
            UPDATE delivery_partners
            SET
                current_latitude = $1,
                current_longitude = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $3
            `,
            [lat, lng, userId]
        );

        const trackingResult = await client.query(
            `
            INSERT INTO delivery_tracking (
                order_id,
                delivery_partner_id,
                latitude,
                longitude,
                status
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [
                orderId,
                userId,
                lat,
                lng,
                order.order_status
            ]
        );

        await client.query('COMMIT');

        try {
            const io = getIO();

            io.to(orderId).emit('deliveryLocationUpdated', {
                orderId,
                latitude: lat,
                longitude: lng,
                status: order.order_status,
                updatedAt: trackingResult.rows[0].updated_at
            });
        } catch (socketError) {
            console.error('Socket notification error:', socketError.message);
        }

        return res.status(200).json({
            success: true,
            message: 'Delivery location updated successfully',
            data: trackingResult.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK').catch(() => {});

        console.error('Update Location Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    } finally {
        client.release();
    }
};

// ============================================================
// GET MY DELIVERIES
// ============================================================

const getMyDeliveries = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const partner = await getDeliveryPartner(userId);

        if (!partner) {
            return res.status(403).json({
                success: false,
                message: 'Delivery partner profile not found'
            });
        }

        const result = await pool.query(
            `
            SELECT
                o.order_id,
                o.order_number,
                o.restaurant_id,
                o.restaurant_name,
                o.user_id AS customer_id,
                u.full_name AS customer_name,
                u.phone AS customer_phone,
                o.subtotal,
                o.delivery_fee,
                o.tax_amount,
                o.total_amount,
                o.payment_method,
                o.payment_status,
                o.order_status,
                o.delivery_address,
                o.special_instructions,
                o.estimated_delivery_time,
                o.actual_delivery_time,
                o.delivered_at,
                o.created_at,
                o.updated_at
            FROM orders o
            INNER JOIN users u
                ON u.user_id = o.user_id
            WHERE o.delivery_partner_id = $1
            ORDER BY o.created_at DESC
            `,
            [userId]
        );

        return res.status(200).json({
            success: true,
            message: 'My deliveries fetched successfully',
            data: result.rows
        });
    } catch (error) {
        console.error('Get My Deliveries Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ============================================================
// GET DELIVERY TRACKING
// ============================================================

const getDeliveryTracking = async (req, res) => {
    try {
        const userId = getAuthenticatedUserId(req);
        const orderId = req.params.orderId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        const result = await pool.query(
            `
            SELECT
                dt.tracking_id,
                dt.order_id,
                dt.delivery_partner_id,
                dt.latitude,
                dt.longitude,
                dt.status,
                dt.updated_at
            FROM delivery_tracking dt
            INNER JOIN orders o
                ON o.order_id = dt.order_id
            WHERE dt.order_id = $1
              AND (
                  o.user_id = $2
                  OR o.delivery_partner_id = $2
                  OR EXISTS (
                      SELECT 1
                      FROM restaurants r
                      WHERE r.restaurant_id = o.restaurant_id
                        AND r.owner_id = $2
                  )
              )
            ORDER BY dt.updated_at ASC
            `,
            [orderId, userId]
        );

        return res.status(200).json({
            success: true,
            message: 'Delivery tracking fetched successfully',
            data: result.rows
        });
    } catch (error) {
        console.error('Get Delivery Tracking Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getMyProfile,
    updateMyProfile,
    updateOnlineStatus,
    updateAvailability,
    getAvailableOrders,
    acceptOrder,
    updateDeliveryStatus,
    updateLocation,
    getMyDeliveries,
    getDeliveryTracking
};

