var express = require('express');
var router = express.Router();
var mkdir = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');

// Get Products Model
var Product = require('../models/product.js');

// Get Category Model
var Category = require('../models/category.js');

// GET products index
router.get('/', function(req,res){
    var count;
    Product.count(function(err,c){
        count = c;
    });
    Product.find(function(err, products){
        res.render('admin/products',{
            products: products,
            count: count
        })
    })
});

// GET Add product request
router.get('/add-product', function(req,res){
    var title = "";
    var desc = "";
    var price = "";
    Category.find(function(err, categories){
        res.render('admin/add_product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price
        })
    });
    
});

//POST add product Request
router.post('/add-product', function(req,res){
    //console.log(req.files.image)
    let imageFile = "";
    if (typeof req.files.image !== "undefined") {
        imageFile = req.files.image.name;
    }
    // let imageFile = typeof req.files.image !== "undefined" ? req.files.image.name: "";
    // console.log(imageFile);
    //check if required fields are entered
    req.checkBody('title','Title must have a value').notEmpty();
    req.checkBody('desc','Description must have a value').notEmpty();
    req.checkBody('price','Price must have a value').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);
    
    //Extract data from body parser.
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var category = req.body.category;
    var price = req.body.price;



    var errors = req.validationErrors();
    if (errors)
    {
        console.log("Errors");
        Category.find(function(err, categories){
            res.render('admin/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            })
        });
    } else{
        Product.findOne({slug: slug}, function(err, product){
            if (product){
                req.flash('danger', 'Product Already Exists, Choose Another');
                Category.find(function(err, categories){
                    res.render('admin/add_product', {
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    });
                });
            } else {
                var price2 = parseFloat(price).toFixed(2);
                var product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                });
                product.save(function(err){
                    if (err) return console.log(err);
                console.log(product._id)
                mkdir('public/product_images/' + product._id, function(err){
                    return console.log(err);
                });
                mkdir('public/product_images/' + product._id + '/gallery', function(err){
                    return console.log(err);
                });
                mkdir('public/product_images/' + product._id + '/gallery/thumbs', function(err){
                    return console.log(err);
                });

                if (imageFile !=""){
                    var productImage = req.files.image;
                    var path = 'public/product_images/' + product._id + '/' + imageFile;
                    productImage.mv(path, function(err){
                        return console.log(err);
                    })
                };
                req.flash('success', 'Product Added!');
                res.redirect('/admin/products');
                });
            }
        });
    }
});

// GET Edit page
router.get('/edit-product/:id', function(req,res){
    var errors;
    if (req.session.errors) errors = req.session.errors;
    req.session.errors = null;
    Category.find(function(err, categories){

        Product.findById(req.params.id, function(err,p){
            if (err){
                res.redirect('/admin/products');
            } else {
                var galleryDir = 'public/product_images/'+p._id+'/gallery/';
                var galleryImages = null;
                fs.readdir(galleryDir, function(err, files){
                    if(err){
                        console.log(err);
                    } else {
                        galleryImages = files;
                    res.render('admin/edit_product',{
                        title: p.title,
                        errors: errors,
                        desc: p.desc,
                        categories: categories,
                        category: p.category,
                        price: parseFloat(p.price).toFixed(2),
                        image: p.image,
                        galleryImages: galleryImages,
                        id: p._id
                    });
                }
                });
            }
        });
});
});


// POST Edit Product
router.post('/edit-product/:id', function(req,res){
    let imageFile = "";
    if (typeof req.files.image !== "undefined") {
        imageFile = req.files.image.name;
    }
    // let imageFile = typeof req.files.image !== "undefined" ? req.files.image.name: "";
    // console.log(imageFile);
    //check if required fields are entered
    req.checkBody('title','Title must have a value').notEmpty();
    req.checkBody('desc','Description must have a value').notEmpty();
    req.checkBody('price','Price must have a value').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);
    //Extract data from body parser.
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var category = req.body.category;
    var price = req.body.price;
    var pimage = req.body.pimage;
    var errors = req.validationErrors();
    
});

// GET Delete Page
router.get('/delete-page/:id', function(req,res){
    Page.findByIdAndRemove(req.params.id, function(err){
        if (err) return console.log(err)
        req.flash('danger', 'Page Deleted !');  
        res.redirect('/admin/pages/');
    });
    });


// Exports
module.exports = router;