var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { 
    title: 'BakeOff App | Discover recipes, challenge your friends',
	url: req.protocol + '://' + req.get('host') + req.originalUrl,
	og_title: 'BakeOff',
	og_description: 'Discover recipes, challenge your friends',
	og_image: req.protocol + '://' + req.get('host') + '/images/placeit_400.png',
	
    partials: {     
      layout: 'layout'   
    }       
    });
});

router.get('/thanks.html', function(req, res) {
  res.render('thanks', { 
    title: 'Thanks for your purchase - BakeOff App',
	url: req.protocol + '://' + req.get('host') + req.originalUrl,
	og_title: 'BakeOff',
	og_description: 'Discover recipes, challenge your friends',
	og_image: req.protocol + '://' + req.get('host') + '/images/placeit_400.png',
	
    partials: {     
      layout: 'layout'   
    }       
    });
});

router.get('/feedback-thanks.html', function(req, res) {
  res.render('terms', { 
    title: 'Thanks for your feedback - BakeOff App',
	url: req.protocol + '://' + req.get('host') + req.originalUrl,
	og_title: 'BakeOff - Thanks for your feedback',
	og_description: 'Discover recipes, challenge your friends',
	og_image: req.protocol + '://' + req.get('host') + '/images/placeit_400.png',
	
    partials: {     
      layout: 'layout'   
    }       
    });
});

router.get('/terms.html', function(req, res) {
  res.render('terms', { 
    title: 'Terms and Conditions - BakeOff App',
	url: req.protocol + '://' + req.get('host') + req.originalUrl,
	og_title: 'BakeOff - Terms',
	og_description: 'Discover recipes, challenge your friends',
	og_image: req.protocol + '://' + req.get('host') + '/images/placeit_400.png',
	
    partials: {     
      layout: 'layout'   
    }       
    });
});

router.get('/privacy.html', function(req, res) {
  res.render('terms', { 
    title: 'Privacy Policy - BakeOff App',
	url: req.protocol + '://' + req.get('host') + req.originalUrl,
	og_title: 'BakeOff - Privacy',
	og_description: 'Discover recipes, challenge your friends',
	og_image: req.protocol + '://' + req.get('host') + '/images/placeit_400.png',
	
    partials: {     
      layout: 'layout'   
    }       
    });
});


module.exports = router;