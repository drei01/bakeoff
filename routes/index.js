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

module.exports = router;