const express = require('express');

const router = express.Router({ mergeParams: true });
const feedsController = require('../controllers/feeds.controller');

router.get('/feed_us.xml', async (req, res, next) => {
  try {
    const xml = await feedsController.getFile();
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
