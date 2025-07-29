const express = require('express')
const router = express.Router()

import ListPilotsController from '../controllers/pilots/listPilotsController'
import IndividualPilotsController from '../controllers/pilots/individualPilotsController'

router.post('/import', ListPilotsController.import)
router.get('/individual/:id', IndividualPilotsController.render)
router.get('/', ListPilotsController.render)

module.exports = router