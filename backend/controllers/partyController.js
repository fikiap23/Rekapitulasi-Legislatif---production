import apiHandler from '../utils/apiHandler.js'
import Party from '../models/partyModel.js'

const partyController = {
  createBulkParties: async (req, res) => {
    try {
      const parties = req.body

      // Validasi apakah kode partai atau nomor partai sudah ada sebelumnya
      const existingParties = await Party.find({
        $or: [
          { code: { $in: parties.map((party) => party.code) } },
          { number_party: { $in: parties.map((party) => party.number_party) } },
        ],
      })

      if (existingParties.length > 0) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'One or more parties already exist',
          error: {
            type: 'Validation',
            details: 'One or more parties already exist',
          },
        })
      }

      // Lakukan operasi insertMany untuk membuat partai-partai baru
      const createdParties = await Party.insertMany(parties)

      return apiHandler({
        res,
        status: 'success',
        code: 201,
        message: 'Parties created successfully',
        data: createdParties,
        error: null,
      })
    } catch (error) {
      return apiHandler({
        res,
        status: 'error',
        code: 500,
        message: 'Internal Server Error',
        error: { type: 'InternalServerError', details: error.message },
      })
    }
  },
  getAllParties: async (req, res) => {
    try {
      // Fetch all parties from the database
      const allParties = await Party.find().select(
        '_id code name logo_url number_party'
      )
      // Sort parties based on the "number_party" field
      allParties.sort((a, b) => a.number_party - b.number_party)

      return apiHandler({
        res,
        status: 'success',
        code: 200,
        message: 'All parties retrieved successfully',
        data: allParties,
        error: null,
      })
    } catch (error) {
      return apiHandler({
        res,
        status: 'error',
        code: 500,
        message: 'Internal Server Error',
        error: { type: 'InternalServerError', details: error.message },
      })
    }
  },
  getAllPartiesAndCandidates: async (req, res) => {
    try {
      // Fetch all parties from the database
      const allParties = await Party.find().select(
        '_id  name logo_url number_party candidates'
      )

      // Sort parties based on the "number_party" field
      allParties.sort((a, b) => a.number_party - b.number_party)

      return apiHandler({
        res,
        status: 'success',
        code: 200,
        message: 'All parties retrieved successfully',
        data: allParties,
        error: null,
      })
    } catch (error) {
      return apiHandler({
        res,
        status: 'error',
        code: 500,
        message: 'Internal Server Error',
        error: { type: 'InternalServerError', details: error.message },
      })
    }
  },
}

export default partyController
