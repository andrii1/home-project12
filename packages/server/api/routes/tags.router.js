/* TODO: This is just an example file to illustrate API routing and
documentation. Can be deleted when the first real route is added. */

const express = require('express');

const router = express.Router({ mergeParams: true });
// const topicProductsRouter = require('./topicProducts.router');

// router.use('/:id/products', topicProductsRouter);

// controllers
const tagsController = require('../controllers/tags.controller');

router.get('/', (req, res, next) => {
  if (req.query.product) {
    tagsController
      .getTagsByProduct(req.query.product)
      .then((result) => res.json(result))
      .catch(next);
  } else {
    try {
      tagsController
        .getTags()
        .then((result) => res.json(result))
        .catch(next);
    } catch (error) {
      res.status(404).json({ error: 'Bad Get Request' });
    }
  }
});

router.get('/:id', (req, res, next) => {
  tagsController
    .getTagById(req.params.id)
    .then((result) => res.json(result))
    .catch(next);
});

router.post('/', (req, res) => {
  const { token } = req.headers;
  tagsController
    .createTag(token, req.body)
    .then((result) => res.json(result))
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.log(error);

      res.status(400).send('Bad request').end();
    });
});

module.exports = router;
