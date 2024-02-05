import History from '../models/historyModel.js'
import User from '../models/userModel.js'
import apiHandler from '../utils/apiHandler.js'
const historyController = {
  getAllHistoryByTps: async (req, res) => {
    try {
      const { tpsId } = req.params
      if (!tpsId) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'Tps ID is required',
          error: null,
        })
      }

      const history = await History.findOne({ tps_id: tpsId })
      if (!history) {
        return apiHandler({
          res,
          status: 'error',
          code: 404,
          message: 'History tps not found',
          data: null,
          error: null,
        })
      }

      // Populate the created_by field in the history array with specific fields
      const populatedHistory = await Promise.all(
        history.history.map(async (entry) => {
          const createdByUser = await User.findById(entry.created_by)
          return {
            ...entry.toObject(),
            created_by: {
              _id: createdByUser._id,
              username: createdByUser.username,
              role: createdByUser.role,
            },
          }
        })
      )

      return apiHandler({
        res,
        status: 'success',
        code: 200,
        message: 'Voting results for all Hisotry retrieved successfully',
        data: populatedHistory,
        error: null,
      })
    } catch (error) {
      console.error('Error getting total results by district:', error)
      return apiHandler({
        res,
        status: 'error',
        code: 500,
        message: 'Internal Server Error',
        data: null,
        error: { type: 'InternalServerError', details: error.message },
      })
    }
  },
}
export default historyController
