const router = require('express').Router();
const c = require('../controllers/studentController');
router.post('/', c.createStudent);
router.get('/', c.getStudents);
router.get('/:id', c.getStudent);
router.put('/:id', c.updateStudent);
router.delete('/:id', c.deleteStudent);
module.exports = router;
