const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Product = require('../models/products')
const multer = require('multer')
const checkAuth = require('../middleware/check-auth')
const config = require('../config/config')

const AWS = require('aws-sdk');
const Busboy = require('busboy');

const BUCKET_NAME = 'node-amazon-s3';
const IAM_USER_KEY = config.iamUser;
const IAM_USER_SECRET = config.iamSecret;

function uploadToS3(file) {
  let s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
    Bucket: BUCKET_NAME
  });
  s3bucket.createBucket(function () {
      var params = {
        Bucket: BUCKET_NAME,
        Key: file.name,
        Body: file.data
      };
      s3bucket.upload(params, function (err, data) {
        if (err) {
          console.log('error in callback');
          console.log(err);
        }
        console.log('success');
        console.log(data);
      });
  });
}

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/')
    },
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    // reject a file
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true)
    }else{
        cb(null, false)
    }
}

const upload = multer({storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
})

/**
 * Handling GET requests
 */
router.get('/', (req, res, next) => {
    Product.find()
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            products: docs.map(doc => {
                return doc
            })
        }
        res.status(200).json(response)
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
})

/**
 * Handling POST requests
 */
router.post('/', checkAuth, (req, res, next) => {
    uploadToS3(req.files.productImage)
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.files.productImage.name
    })
    product
    .save()
    .then(result => {
        res.status(201).json({
        message: 'Product was created',
        createdProduct: {
            name: result.name,
            price: result.price,
            _id: result._id
        }
    })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

/**
 * GET a single product
 */
router.get('/:productId', (req, res, next) => {
    const id = req.params.productId
    Product.findById(id)
    .exec()
    .then(doc => {
        if(doc){
            res.status(200).json(doc)
        }else{
            res.status(404).json({message: 'No valid entry found for provided ID'})
        }
        
    })
    .catch(err => {
        res.status(500).json({error: err})
    })
})

/**
 * PATCH request used toupdate product
 */
router.patch('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId
    const updateOps = {}
    for (const ops of req.body){
        updateOps[ops.propName] = ops.value
    }
    Product.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Product updated'
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

/**
 * DELETE request to remove/delete a product
 */
router.delete('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId
    Product.remove({
        _id: id
    })
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Product deleted'
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
})

module.exports = router