const express = require('express');
const router = express.Router();
const courtController = require('../controllers/courtController')
const { catchErrors } = require('../handlers/errorHandlers')

// Do work here
router.get('/', catchErrors(courtController.getCourts));
router.get('/courts', catchErrors(courtController.getCourts));
router.get('/add', courtController.addCourt);
router.post('/add', catchErrors(courtController.createCourt));
router.get('/courts/:id/edit', catchErrors(courtController.editCourt))
router.post('/add/:id', catchErrors(courtController.updateCourt))

module.exports = router;
