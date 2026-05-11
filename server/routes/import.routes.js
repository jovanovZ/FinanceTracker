const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const { importCSV } = require('../controllers/importController');

router.post('/csv', protect, upload.single('file'), importCSV);

module.exports = router;
