var express = require('express');
var router = express.Router();

// Get Page Model
var Page = require('../models/page.js');

router.get('/', function(req,res){
    Page.find({}).sort({sorting: 1}).exec(function (err,pages){
        res.render('admin/pages', {
            pages: pages,  
        })
    })
});

// GET request
router.get('/add-page', function(req,res){
    var title = "";
    var slug = "";
    var content = "";
    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    })
});


//POST Request

router.post('/add-page', function(req,res){

    //check if required fields are entered
    req.checkBody('title','Title must have a value').notEmpty();
    req.checkBody('content','Content must have a value').notEmpty();
    
    //Extract data from body parser.
    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    // we are removing the spaces with '-'
    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;

    var errors = req.validationErrors();
    if (errors)
    {
        console.log("Errors");
        res.render('admin/add_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        });
    } else{
        Page.findOne({slug: slug}, function(err, page){
            if (page){
                req.flash('danger', 'Page Slug Exists, Choose Another');
                res.render('admin/add_page', {
                    title: title,
                    slug: slug,
                    content: content
                });
            } else {
                var page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });
                page.save(function(err){
                    if (err) return console.log(err);
                req.flash('success', 'Page Added!');
                res.redirect('/admin/pages');
                });
            }
        });
    }
});

// GET Edit page
router.get('/edit-page/:id', function(req,res){
    Page.findById(req.params.id, function(err,page){
        if (err) return console.log(err);
        res.render('admin/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    });
    
});


// POST Edit Page
router.post('/edit-page/:id', function(req,res){

    //check if required fields are entered
    req.checkBody('title','Title must have a value').notEmpty();
    req.checkBody('content','Content must have a value').notEmpty();
    
    //Extract data from body parser.
    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    // we are removing the spaces with '-'
    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var id = req.params.id;

    var errors = req.validationErrors();
    if (errors)
    {
        console.log("Errors");
        res.render('admin/edit_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    } else{
        Page.findOne({slug: slug, _id:{'$ne': id}}, function(err, page){
            if (page){
                req.flash('danger', 'Page Slug Exists, Choose Another');
                res.render('admin/edit_page', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            } else {
                Page.findById(id, function(err,page){
                    if (err) return console.log(err);
                    page.title = title;
                    page.slug = slug;
                    page.content = content;
                    page.save(function(err){
                    if (err) return console.log(err);
                    req.flash('success', 'Page Updated !');
                    res.redirect('/admin/pages/edit-page/'+id);
                });
                });
                
            }
        });
    }
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