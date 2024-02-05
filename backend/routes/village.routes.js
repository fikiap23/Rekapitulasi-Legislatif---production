import express from 'express'

import { protectAdminRoute } from '../middlewares/protectRoute.js'
import villageController from '../controllers/villageController.js'

const router = express.Router()

router.post('/', protectAdminRoute, villageController.createOneVillage)
router.post('/bulk', protectAdminRoute, villageController.createBulkVillages)
router.post(
  '/bulk/:district_id',
  protectAdminRoute,
  villageController.createBulkVillagesByDistrict
)

// get all villages
router.get('/', villageController.getAllVillages)
// Retrieving all villages by district ID
router.get('/:district_id', villageController.getAllVillageByDistrictId)

export default router
