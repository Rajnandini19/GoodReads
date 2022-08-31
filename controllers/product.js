//for handling image upload
const formidable = require('formidable')
//for updating the product
const _ = require('lodash');
//fs=file system
const fs = require('fs');
const Product = require("../models/Product");
const { errorHandler } = require('../helpers/dbErrorHandler');


exports.productById = (req,res,next,id) => {
    Product.findById(id).exec((err, product) => {
        if(err || !product)
        {
            return res.status(400).json({
                error:"Product not found"
            });
        }

        req.product = product
        next();
    });
};


exports.read = (req,res) => {
    //we dont want to send the photo now because that is 
    //going to be huge in size
    req.product.photo = undefined
    return res.json(req.product);
}

exports.create = (req,res) => {
    let form = new formidable.IncomingForm()
    //whatever image type we are getting extensions will
    // be true
    form.keepExtensions = true 
    //we will traverse through all the field in product 
    //and if get any file then we will deal with it like this
    form.parse(req, (err,fields,files) => {
        if(err)
        {
            return res.status(400).json({
                error: 'Image could not be uploaded'
            })
        }

        //check for all fields
        const { 
            name, 
            description, 
            price, 
            category, 
            quantity, 
            shipping } = fields;

        if(
            !name || 
            !description || 
            !price || 
            !category || 
            !quantity || 
            !shipping)
        {
            return res.status(400).json({
                error:"All fields are required"
            });
        }

        let product = new Product(fields)

        if (files.photo) {
            // console.log("FILES PHOTO: ", files.photo);
            if (files.photo.size > 1000000) {
              return res.status(400).json({
                error: "Image should be less than 1mb in size",
              });
            }
            product.photo.data = fs.readFileSync(files.photo.filepath); // change path to filepath
            product.photo.contentType = files.photo.mimetype; // change typt to mimetype
          }

          product.save((err,result) => {
              if(err)
              {
                  return res.status(400).json({
                      error:errorHandler(error)
                  });
              }
              res.json(result);
          });

    });
};

exports.remove = (req,res) => {
    let product = req.product
    product.remove((err, deletedProduct) => {
        if(err)
        {
            return res.status(400).json({
                error:errorHandler(err)
            });
        }
        res.json({
            message: "Product deleted successfully"
        });
    });
};

exports.update = (req,res) => {
    let form = new formidable.IncomingForm()
    //whatever image type we are getting extensions will
    // be true
    form.keepExtensions = true 
    //we will traverse through all the field in product 
    //and if get any file then we will deal with it like this
    form.parse(req, (err,fields,files) => {
        if(err)
        {
            return res.status(400).json({
                error: 'Image could not be uploaded'
            })
        }

        //check for all fields
        const { 
            name, 
            description, 
            price, 
            category, 
            quantity, 
            shipping } = fields;

        if(
            !name || 
            !description || 
            !price || 
            !category || 
            !quantity || 
            !shipping)
        {
            return res.status(400).json({
                error:"All fields are required"
            });
        }

        let product = req.product
        product = _.extend(product, fields );

        if (files.photo) {
            // console.log("FILES PHOTO: ", files.photo);
            if (files.photo.size > 1000000) {
              return res.status(400).json({
                error: "Image should be less than 1mb in size",
              });
            }
            product.photo.data = fs.readFileSync(files.photo.filepath); // change path to filepath
            product.photo.contentType = files.photo.mimetype; // change typt to mimetype
          }

          product.save((err,result) => {
              if(err)
              {
                  return res.status(400).json({
                      error:errorHandler(error)
                  });
              }
              res.json(result);
          });

    });
};

/** 
 * SELL
 * if some products are sold more than the other products
 * we should be able to show those products that is display
 * most popular product
 * by sell = /products?sortBy=sold&order=desc&limit=4
 * 
 * 
 * ARRIVAL
 * we should be able to show the recently arrived products
 * to the client
 * by arrival = /products?sortBy=createdAt&order=desc&limit=4
 * 
 * 
 * if no params are set then all products are returned
*/

exports.list = (req,res) => {
    let order = req.query.order ? req.query.order : 'asc'
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
    let limit = req.query.limit ? parseInt(req.query.limit):6


    Product.find()
    //we will not send the photo of the products along with 
    //other data because it will be slow.....we will make 
    //another request to fetch the photo of that product
        .select("-photo")
    //we can use populate as we have added type: object 
    //id and ref Category in products model
    //this method will populate particular category
    // associated with this product
        .populate('category')
        .sort([[sortBy,order]])
        .limit(limit)
        .exec((err, products) => {
            if(err)
            {
                return res.status(400).json({
                    error: 'Products not found'
                })
            }

            res.json(products)

        });

          
};

/**
 * it will find the products based on the req product category
 * other products that has the same category will be returned
 */

exports.listRelated = (req,res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) :6;

   //ne not equals in mongo db
   //we want all related products except the product itself
   //we have to fetch related product based on category
    Product.find({_id: {$ne: req.product}, category: req.product.category})
     .limit(limit)
     .populate('category', '_id name')
     .exec((err,products) => {
         if(err)
         {
             return res.status(400).json({
                 error:"Products not found"
             })
         }
         res.json(products)
     })

}


//it will return the categories that are used for products
//ex - we have 4 total categories but we have used only 2
//for our products so it will return objectid of those 2
//categories
exports.listCategories = (req,res) => {
    Product.distinct("category", {}, (err,categories) => {
        if(err)
        {
            return res.status(400).json({
                error:"Categories not found"
            });
        }
        res.json(categories);
    })
}

/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range 
 * in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users
 * based on what he wants
 */
 

 
exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    //we will initially show 6 products but if they want to
    //view more products they will click on the load more btn
    let skip = parseInt(req.body.skip);
    // this will have category id and price range
    let findArgs = {}; 
 
    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);
 
    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }
 
    Product.find(findArgs)
        .select("-photo")
        .populate("category")
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};


exports.photo = (req,res,next) => {
    if(req.product.photo.data)
    {
        res.set('Content-Type', req.product.photo.contentType)
        return res.send(req.product.photo.data);
    }
    next();
};

exports.listSearch = (req,res) => {
    //create query object to hold search value & category value
    const query = {};
    //assign search value to query.name
    if(req.query.search)
    {
        query.name = { $regex: req.query.search, $options: 'i'};
        //assign category value to query.category
        if(req.query.category && req.query.category != 'All')
        {
            query.category = req.query.category;
        }
        //find the product based on query object with 2 properties
        //search and category

        Product.find(query, (err, products) => {
            if(err)
            {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }

            res.json(products)
        }).select('-photo');
    }

}



 