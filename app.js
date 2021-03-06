require('dotenv').config();

const express = require('express');
const hbs = require('hbs');
const SpotifyWebApi = require('spotify-web-api-node')
const app = express();
const path = require('path');

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
//app.use(express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
});

// Retrieve an access token
spotifyApi
    .clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body['access_token']))
    .catch(error => console.log('Something went wrong when retrieving an access token', error));

//Partials
hbs.registerPartials(__dirname + '/views/partials');

// Our routes go here:
app.get('/', (req, res, next) => res.render('index', { layout: false} ));

app.get('/artist-search', (req, res, next) => {
    spotifyApi
        .searchArtists(req.query.search)
        .then(data => {
            const artists = data.body.artists.items;
            res.render('artist-search-results', {artists: artists});
        })
        .catch(err => console.log('The error while searching artists occurred: ', err));
});

app.get('/albums/:id', (req, res, next) => {
    spotifyApi.getArtistAlbums(req.params.id).then(
        function(data) {
          const albums = data.body.items;
          res.render('albums', {albums: albums});
        },
        function(err) {
          console.error(err);
        }
    );
})

app.get('/tracks/:id', (req, res, next) => {
    spotifyApi.getAlbumTracks(req.params.id, { limit : 6, offset : 1 })
  .then(function(data) {
    const tracks = data.body.items;
    res.render('tracks', {tracks: tracks});
  }, function(err) {
    console.log('Something went wrong!', err);
  });
})

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));