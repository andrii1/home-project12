const express = require('express');

const router = express.Router();

const exampleResources = require('./exampleResources.router');
const products = require('./products.router');
const categories = require('./categories.router');
const platforms = require('./platforms.router');
const countries = require('./countries.router');
const areas = require('./areas.router');
const cities = require('./cities.router');
const users = require('./users.router');
const favorites = require('./favorites.router');
const ratings = require('./ratings.router');
const stripe = require('./stripe.router');
const comments = require('./comments.router');
const cloudinary = require('./cloudinary.router');
// const appsAppStore = require('./appsAppStore.router');
// const appsAppStoreScraper = require('./appsAppStoreScraper.router');
// const searches = require('./searches.router');
const keywords = require('./keywords.router');
// const analytics = require('./analytics.router');
// const positiveLikes = require('./positiveLikes.router');
// const negativeLikes = require('./negativeLikes.router');
// const threads = require('./threads.router');
// const replies = require('./replies.router');
// const ratingsForThreads = require('./ratingsForThreads.router');
const tags = require('./tags.router');
const highlights = require('./highlights.router');
const userTypes = require('./userTypes.router');
const occasions = require('./occasions.router');
const useCases = require('./useCases.router');
// const industries = require('./industries.router');
const findAppleIdByUrl = require('./findAppleIdByUrl.router');
const sitemaps = require('./sitemaps.router');
const feeds = require('./feeds.router');

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

router.use('/exampleResources', exampleResources);
router.use('/products', products);
router.use('/categories', categories);
router.use('/platforms', platforms);
router.use('/countries', countries);
router.use('/areas', areas);
router.use('/cities', cities);
router.use('/users', users);
router.use('/favorites', favorites);
router.use('/ratings', ratings);
router.use('/stripe', stripe);
router.use('/cloudinary', cloudinary);
router.use('/comments', comments);
// router.use('/appsAppStore', appsAppStore);
// router.use('/appsAppStoreScraper', appsAppStoreScraper);
// router.use('/searches', searches);
router.use('/keywords', keywords);
// router.use('/analytics', analytics);
// router.use('/positiveLikes', positiveLikes);
// router.use('/negativeLikes', negativeLikes);
// router.use('/threads', threads);
// router.use('/replies', replies);
// router.use('/ratingsForThreads', ratingsForThreads);
router.use('/tags', tags);
router.use('/highlights', highlights);
router.use('/userTypes', userTypes);
router.use('/occasions', occasions);
router.use('/useCases', useCases);
// router.use('/industries', industries);
router.use('/findAppleIdByUrl', findAppleIdByUrl);
router.use('/sitemaps', sitemaps);
router.use('/feeds', feeds);

module.exports = router;
