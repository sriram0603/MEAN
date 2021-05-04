var express = require('express');
var router = express.Router();

// Get Category Model
var Category = require('../models/category.js');

// Get Category Index
router.get('/', function(req,res){
    Category.find(function(err,categories){
        if (err) return console.log(err);
        res.render('admin/categories', {
            categories: categories
        })
    });
});

// GET request
router.get('/add-category', function(req,res){
    var title = "";
    res.render('admin/add_category', {
        title: title,
    })
});


//POST Request

router.post('/add-category', function(req,res){

    //check if required fields are entered
    req.checkBody('title','Title must have a value').notEmpty();
    
    //Extract data from body parser.
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    // we are removing the spaces with '-'
    var errors = req.validationErrors();
    if (errors)
    {
        console.log("Category Errors");
        res.render('admin/add_category', {
            errors: errors,
            title: title,
        });
    } else{
        Category.findOne({title: title}, function(err, category){
            if (category){
                req.flash('danger', 'Category Title Exists, Choose Another');
                res.render('admin/add_category', {
                    title: title,
                });
            } else {
                var category = new Category({
                    title: title,
                });
                category.save(function(err){
                    if (err) return console.log(err);
                req.flash('success', 'Category Added!');
                res.redirect('/admin/categories');
                });
            }
        });
    }
});

// GET Edit Category
router.get('/edit-category/:id', function(req,res){
    Category.findById(req.params.id, function(err,category){
        if (err) return console.log(err);
        res.render('admin/edit_category', {
            title: category.title,
            id: category._id
        });
    });
});


// POST Edit Category
router.post('/edit-category/:id', function(req,res){

    //check if required fields are entered
    req.checkBody('title','Title must have a value').notEmpty();
    
    //Extract data from body parser.
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    // we are removing the spaces with '-'
    var id = req.params.id;
    var errors = req.validationErrors();
    if (errors)
    {
        console.log("Errors");
        res.render('admin/edit_category', {
            errors: errors,
            title: title,
        });
    } else{
        Category.findOne({islug: slug, _id:{'$ne': id}}, function(err, category){
            if (category){
                req.flash('danger', 'Category Title Exists, Choose Another');
                res.render('admin/edit_category', {
                    title: title,
                    id: id
                    
                });
            } else {
                Category.findById(id, function(err,category){
                    if (err) return console.log(err);
                    category.title = title;
                    category.slug = slug;
                    category.save(function(err){
                    if (err) return console.log(err);
                    req.flash('success', 'Category Updated !');
                    res.redirect('/admin/categories/edit-category/'+id);
                });
                });
                
            }
        });
    }
});

// GET Delete Category
router.get('/delete-category/:id', function(req,res){
    Category.findByIdAndRemove(req.params.id, function(err){
        if (err) return console.log(err)
        req.flash('success', 'Category Deleted !');  
        res.redirect('/admin/categories/');
    });
    });




// Exports
module.exports = router;