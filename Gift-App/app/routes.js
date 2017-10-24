var User = require('./models/user');
const request = require('request-promise');

module.exports = function(app, passport){

	app.get('/', function(req, res){
		res.render('index.ejs');
	});

	app.get('/login', function(req, res){
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});
	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/profile',
		failureRedirect: '/login',
		failureFlash: true
	}));

	app.get('/signup', function(req, res){
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});


	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/',
		failureRedirect: '/signup',
		failureFlash: true
	}));

	app.get('/profile', isLoggedIn, function(req, res){

		res.render('profile.ejs', { user: req.user });

	});

	app.get('/result',isLoggedIn, function(req,res){

					//console.log(req.query.search);
					var query = req.query.search;

					var user_access_token = req.user.facebook.token

					const userFieldSet = query;
					// for friends' likes
					//https://graph.facebook.com/me/friends?fields=name,id,likes.limit(100).fields(id,name)&limit=100

        

 				const options = {
	 			method: 'GET',
	 			uri: `https://graph.facebook.com/v2.8/${req.user.facebook.id}`,
	 			qs: {
		 		access_token: user_access_token,
		 		fields: userFieldSet
	 		   }
       	};
	 	 		request(options, function(error, response,body){

		 			if (!error && response.statusCode == 200){
			 			var parsedData = JSON.parse(body);

			 			res.render("result.ejs",{parsedData : parsedData });
		 			}
		 			else {
						console.log("error");
					}

	 		});






	});

	app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email','user_likes','user_friends']}));

	app.get('/auth/facebook/callback',
	  passport.authenticate('facebook', { successRedirect: '/profile',
	                                      failureRedirect: '/' }));


	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	})



} //my

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()){
		return next();
	}

	res.redirect('/login');
}
