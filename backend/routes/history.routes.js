import express from 'express'
import historyController from '../controllers/historyController.js'

const router = express.Router()

router.get('/:tpsId', historyController.getAllHistoryByTps)

export default router
