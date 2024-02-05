import express from 'express'
import districtController from '../controllers/districtController.js'
import { protectAdminRoute } from '../middlewares/protectRoute.js'

const router = express.Router()

router.post('/', protectAdminRoute, districtController.createNewDistrict)
router.get('/', districtController.getAllDistricts)
router.get('/names', districtController.getAllDistrictNames)

router.post('/bulk', protectAdminRoute, districtController.bulkDistricts)

export default router
