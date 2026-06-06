const router = require('express').Router();
const c = require('../controllers/resultController');
router.get('/class', c.getClassResults);
router.get('/subject', c.getSubjectPerformance);
router.get('/grades', c.getGrades);
router.put('/grades', c.updateGrades);
module.exports = router;
