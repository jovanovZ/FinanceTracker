import express from 'express';

const router = express.Router();

// test da ce spila
router.get('/', function(req, res, next) {
  res.status(200).send("anei gei");
});

export default router;