import express from 'express'
import tpsController from '../controllers/tpsController.js'
import { protectUserTpsRoute } from '../middlewares/protectRoute.js'

const router = express.Router()

router.get('/', tpsController.getAllTps)

router.get('/village/:villageId', tpsController.getAllTpsByVillageId)
router.get('/district/:districtId', tpsController.getAllTpsByDistrictId)
router.get('/:tpsId', tpsController.getTpsById)
router.post('/bulk', tpsController.bulkTps)
router.post(
  '/fill/:tpsId',
  protectUserTpsRoute,
  tpsController.fillValidBallotsDetail
)

export default router
