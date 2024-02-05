import express from 'express'
import partyController from '../controllers/partyController.js'
import { protectAdminRoute } from '../middlewares/protectRoute.js'

const router = express.Router()

// Route for bulk party creation
router.post('/bulk', protectAdminRoute, partyController.createBulkParties)

// Route for getting all parties
router.get('/', partyController.getAllParties)

// Route for getting all parties and their candidates
router.get('/candidates', partyController.getAllPartiesAndCandidates)

export default router
