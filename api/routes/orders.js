const express = require('express')
const router = express.Router()

/**
 * Handling GET requests
 */
router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Orders were fetched'
    })
})

/**
 * Handling POST requests
 */
router.post('/', (req, res, next) => {
    const order = {
        productId: req.body.productId,
        quantity: req.body.quantity
    }
    res.status(201).json({
        message: 'Order was created',
        order: order
    })
})

/**
 * GET a single order
 */
router.get('/:orderId', (req, res, next) => {
    res.status(200).json({
        message: 'Order details',
        orderId: req.params.orderId
    })
})

/**
 * DELETE request to remove/delete a order
 */
router.delete('/:orderId', (req, res, next) => {
    res.status(200).json({
        message: 'Deleted order',
        orderId: req.params.orderId
    })
})

module.exports = router