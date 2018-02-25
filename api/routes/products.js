const express = require('express')
const router = express.Router()

/**
 * Handling GET requests
 */
router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Products were fetched'
    })
})

/**
 * Handling POST requests
 */
router.post('/', (req, res, next) => {
    const product = {
        name: req.body.name,
        price: req.body.price
    }
    res.status(201).json({
        message: 'Product was created',
        createdProduct: product
    })
})

/**
 * GET a single product
 */
router.get('/:productId', (req, res, next) => {
    const id = req.params.productId
    res.status(200).json({
        message: 'Product was fetched'
    })
})

/**
 * PATCH request used toupdate product
 */
router.patch('/:productId', (req, res, next) => {
    res.status(200).json({
        message: 'Updated product'
    })
})

/**
 * DELETE request to remove/delete a product
 */
router.delete('/:productId', (req, res, next) => {
    res.status(200).json({
        message: 'Deleted product'
    })
})

module.exports = router