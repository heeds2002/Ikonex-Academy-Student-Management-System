const router = require('express').Router();
const c = require('../controllers/reportController');
router.get('/student/:studentId/pdf', c.studentReportPdf);
router.get('/class/:streamId/pdf', c.classReportPdf);
module.exports = router;
