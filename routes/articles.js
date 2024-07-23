const express = require('express');
const router = express.Router();

//bring in article Model
let Article = require('../models/article');
//User model
let User = require('../models/user');
  
  //add route
router.get('/add',ensureAuthenticated,function(req,res){
    res.render('add_article',{
        title:'Add Article'
    })
});

//Add submit post route
router.post('/add', async function (req, res) {
    req.checkBody('title','Title is required').notEmpty();
    //req.checkBody('author','Author is required').notEmpty();
    req.checkBody('body','Body is required').notEmpty();

    //Get errors
    let errors = req.validationErrors();
    if(errors){
        res.render('add_article',{
            title: 'Add Article',
            errors:errors
        });
    }else{
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;
  
        try {
        await article.save();
        req.flash('success','Article Added Succesfully');
        res.redirect('/');
        } catch (err) {
            console.error(err);
            // Handle the error case here, if needed
        }
    }
  });
//Load edit form
router.get('/edit/:id', ensureAuthenticated,async function (req, res) {
    try {
      const article = await Article.findById(req.params.id);
      if (!article) {
        return res.status(404).send('Article not found');
      }
  
      res.render('edit_article', {
        article: article,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  }); 
  //update and submit post route
router.post('/edit/:id', async function (req, res) {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;
  
    let query = { _id: req.params.id };
  
    try {
      // Use updateOne to update the article
      const result = await Article.updateOne(query, article);
  
      if (result.nModified === 0) {
        // Handle the case where no article was modified
        return res.status(404).send('Article not found or not modified');
      }
      req.flash('success','Article updated succesfully');
      res.redirect('/');
    } catch (err) {
      console.error(err);
      // Handle the error case here, if needed
      res.status(500).send('Internal server error');
    }
  });
  
// Delete article route
router.post('/delete/:id', async (req, res) => {
  try {
    const articleId = req.params.id;

    // Find the article by ID
    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).send('Article not found');
    }

    // Check if the current user is the author of the article
    if (article.author.toString() !== req.user._id.toString()) {
      return res.status(403).send('You are not authorized to delete this article');
    }

    // If the user is the author, proceed with deleting the article
    const result = await Article.deleteOne({ _id: articleId });

    if (result.deletedCount === 0) {
      // Handle the case where no article was deleted
      return res.status(404).send('Article not found or not deleted');
    }

    res.redirect('/');
  } catch (err) {
    console.error(err);
    // Handle the error case here, if needed
    res.status(500).send('Internal server error');
  }
});

//get single article
router.get('/:id', async function (req, res) {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).send('Article not found');
    }

    const user = await User.findById(article.author);
    if (user) {
      res.render('article', {
        article: article,
        author: user.name
      });
    } else {
      res.status(404).send('Author not found');
    }
  } catch (err) {
    console.error(err);
    // Handle the error case here, e.g., send an error response or render an error page
    res.status(500).send('Internal server error');
  }
});
//Access control
function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    req.flash('danger','Please login');
    res.redirect('/users/login');
  }
}
module.exports = router;