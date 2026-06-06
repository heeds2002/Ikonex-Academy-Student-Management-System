const router = require('express').Router();
const c = require('../controllers/scoreController');
router.post('/', c.createScore);
router.get('/', c.getScores);
router.put('/:id', c.updateScore);
router.delete('/:id', c.deleteScore);
module.exports = router;
