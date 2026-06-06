const router = require('express').Router();
const c = require('../controllers/subjectController');
router.post('/', c.createSubject);
router.get('/', c.getSubjects);
router.get('/:id', c.getSubject);
router.put('/:id', c.updateSubject);
router.delete('/:id', c.deleteSubject);
module.exports = router;
