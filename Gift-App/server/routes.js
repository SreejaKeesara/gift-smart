const Upload = require('./upload/upload.server.controller')
const multipart = require('connect-multiparty')
const multipartMiddleware = multipart()
var User = require('./models/user');
const request = require('request-promise');
var configAuth 				= require('../config/auth');
var querystring = require('querystring');

var async = require('async');
var uris =[];

var emotion;

var client_id = 'd4b7cff552d14370b93aee992ac9bdeb'; // Your client id
var client_secret = '68a7506f75294184a25af80a1e3850fb'; // Your secret
var redirect_uri = 'http://localhost:8000/spotify/callback'; // will remove
var playlist_id;
var uri;
var playlist_uri;
var index=0;

var dict = {};

var artist_track = [];

dict['sadness'] = "(mood_65324)";
dict['neutral'] = "(mood_42946)";
dict['disguist'] = "(mood_42958)";
dict['anger'] = "(mood_42958)";
dict['suprise'] = "(mood_42960)";
dict['fear'] = "(mood_65329)";
dict['hapiness'] = "(65322)";







module.exports = function(app, passport){

	app.get('/test', Upload.displayForm)
	app.post('/upload', multipartMiddleware, Upload.upload)

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
					//var query = req.body.image;  //replace this with face_token



          var imageName = Upload.imageName

          var query = "http://S3.us-east-2.amazonaws.com/faceapp-assets/"+imageName;

					console.log(query);

          //query = "http://everydayshouldbefun.com/wp-content/uploads/2017/01/1435305770-36a7c3951a2bb484f033814ee652156a-600x398.jpg"

					const userFieldSet = query;
					// for friends' likes
					//https://graph.facebook.com/me/friends?fields=name,id,likes.limit(100).fields(id,name)&limit=100



 				const options = {
	 			method: 'POST',
	 			uri: `https://api-us.faceplusplus.com/facepp/v3/detect`,
	 			qs: {
		 		api_key: "3vRtvVYa4DDJUwuKPGiA44LJpPAf6H5i",
				api_secret:"HkO0rQkGTS2Pi3OuPEQ-y8qLYIeONGW6",
				image_url:query,
				return_attributes: "emotion"
	 		   }
       	};
	 	 		request(options, function(error, response,body){

		 			if (!error && response.statusCode == 200){
			 			var parsedData = JSON.parse(body);

						emotions =(parsedData["faces"][0]["attributes"]["emotion"]);

						var emotion;

						var check = 0;

						for(var attributename in emotions){



								console.log(parseInt(emotions[attributename]))

                if (parseInt(emotions[attributename]) >= check){
								     emotion = attributename;
										 check = parseInt(emotions[attributename])
             }

}

             music(res,req,emotion);
			 			//res.render("result.ejs",{parsedData : emotion });


		 			}
		 			else {
						console.log("error");
					}

	 		});

	});






function music(res,req,emotion){


					//var query = req.query.search;


        mood = dict[emotion];



				//console.log(mood)

				const options = {
				method: 'GET',
				uri: `https://c109317344.web.cddbp.net/webapi/json/1.0/radio/recommend`,
				qs: {
				client: "109317344-838C752F1A38763006AAEB09295D9F21",
				user:"43446129425491942-0AD171CD3A77BD28269F257DABF8E46C",
        //seed:"(mood_65323);(text_artist_blink-182)",
				seed: mood,
				return_count:"10"
				 }
				};
				request(options, function(error, response,body){

					if (!error && response.statusCode == 200){
						var parsedData = JSON.parse(body);
						var jsonMood = JSON.stringify(emotion)
						
						console.log(parsedData)

						var album_0 = parsedData["RESPONSE"][0]["ALBUM"];
						//console.log(album_0)

					for(var i in album_0){


								//console.log(parsedData["RESPONSE"][0]["ALBUM"][i]["ARTIST"][0]["VALUE"])
								//console.log(parsedData["RESPONSE"][0]["ALBUM"][i]["TITLE"][0]["VALUE"])


								artist_track.push([parsedData["RESPONSE"][0]["ALBUM"][i]["ARTIST"][0]["VALUE"],parsedData["RESPONSE"][0]["ALBUM"][i]["TITLE"][0]["VALUE"]])


					}

					console.log(artist_track)

					var jsonString = JSON.stringify(artist_track);



						res.render("result.ejs",{parsedMood : jsonMood });
					}
					else {
						console.log("error");
					}

			});

	};






	app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email','user_likes','user_friends']}));

	app.get('/auth/facebook/callback',
	  passport.authenticate('facebook', { successRedirect: '/profile',
	                                      failureRedirect: '/' }));


	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	})

// spotify----------------------


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';


app.get('/result', function(req,res){

   res.render("test.ejs");
})

app.get('/spotify-login', function(req, res) {



  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email playlist-modify-private playlist-modify-public';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});


app.get('/spotify/callback', function(req,res){

        spotifyplaylist(req,res)
});



var spotifyplaylist = function (req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options1 = {

          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options1, function(error, response, body) {
          //console.log(body);

          user_id = body.id;



        options = {

          uri: 'https://api.spotify.com/v1/users/'+user_id+'/playlists',
          body: JSON.stringify({name: 'test00', public: false}),
          headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
           },
            success: function(response) {
            console.log(response);
          }
        };

        request.post(options, function(error, response,body){
					 if (!error){
							var parsedData = JSON.parse(body);
            	playlist_id = parsedData["id"]
            	playlist_uri = parsedData["uri"]
              processResponse1(playlist_id)

						}
						else {
							console.log("error");
						}
			 });



            //loop here
    function processResponse1(playlist_id){

         for(i=0;i<artist_track.length;i++){

         console.log(i)
				 console.log(artist_track[i])
         artist = artist_track[i][0];
				 track = artist_track[i][1];

          option2 = {
                uri: 'https://api.spotify.com/v1/search',
                headers: {
                  'Authorization': 'Bearer ' + access_token
                },
                qs: {

                  //q: "track:lonely artist:Akon",
									q: "track:"+track+" artist:"+artist,
                  type: "track"
                }

            };

          request.get(option2, function(error,response,body){
            if (!error){
  						var parsedData2 = JSON.parse(body);
							console.log('---test--1')

							console.log(artist_track.length)
							console.log('---test--1')


							if ((parsedData2["tracks"]["items"]).length>0){
							 //console.log((parsedData2["tracks"]["items"]).length);
               uri = (parsedData2["tracks"]["items"][0]["uri"])
							// console.log(uri)


							 processResponse2(uri,playlist_id)


						 }

						}
							else{
								console.log("error")
							}

				});
			};
		}


				 function processResponse2(uri,playlist_id) {
					console.log("-----test-----")
					console.log(playlist_id)

					console.log("-----test-----")
          option3 = {
                uri: 'https://api.spotify.com/v1/users/'+user_id+'/playlists/'+playlist_id+'/tracks',
                headers: {
                  'Authorization': 'Bearer ' + access_token,
                  'Content-Type': 'application/json'

                },
                body: JSON.stringify({"uris": [uri]})
          };

          request.post(option3, function(error,response,body){
                  if (!error){
        						var parsedData3 = JSON.parse(body);
                    //console.log(parsedData3)

										//res.render("test.ejs",{parsedData: playlist_uri});
                  }
                  else{
                    console.log("error")}
            	});


						}



					//yeta



				});

    }; //top if
  });
}
res.render("test.ejs",{parsedData : playlist_uri });
};


app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});





}

 //my helper function

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()){
		return next();
	}

	res.redirect('/login');
}


exports.binder=(req, res, imageName)=>{

imageName = imageName;
console.log(imageName)


};
