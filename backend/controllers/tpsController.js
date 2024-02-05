import mongoose from 'mongoose'
import Village from '../models/villageModel.js'
import Tps from '../models/tpsModel.js'
import History from '../models/historyModel.js'
import Party from '../models/partyModel.js'
import apiHandler from '../utils/apiHandler.js'

const tpsController = {
  bulkTps: async (req, res) => {
    try {
      const bulkTpsData = req.body

      // Create an array to store all TPS documents for insertion
      const tpsDocuments = []

      // Loop through the bulkTpsData array and process each village's TPS data
      for (const villageData of bulkTpsData) {
        const { village_code, tps } = villageData

        // Find or create the village based on the village_code
        let village = await Village.findOne({ code: village_code })

        if (!village) {
          return apiHandler({
            res,
            status: 'error',
            code: 404,
            message: 'One or more villages not found',
            error: null,
          })
        }

        // Create TPS documents for the village
        const tpsEntries = tps.map((tpsData) => ({
          number: tpsData.number,
          total_voters: tpsData.total_voters,
          village_id: village._id,
          village_code: village.code,
          district_id: village.district_id,
        }))

        // Add the TPS documents to the array
        tpsDocuments.push(...tpsEntries)
      }

      // Use insertMany to insert all TPS documents at once
      const insertedTps = await Tps.insertMany(tpsDocuments)

      // Update the village.tps array with the inserted TPS document IDs
      for (const villageData of bulkTpsData) {
        const { village_code, tps } = villageData
        const village = await Village.findOne({ code: village_code })

        // Find the corresponding TPS documents using the number and total_voters
        const correspondingTps = tps.map((tpsData) => {
          const { number, total_voters } = tpsData
          return insertedTps.find(
            (insertedTpsData) =>
              insertedTpsData.number === number &&
              insertedTpsData.total_voters === total_voters
          )
        })

        // Update the village.tps array with the corresponding TPS document IDs
        village.tps.push(...correspondingTps.map((tps) => tps._id))

        // Save the updated village with the new TPS references
        await village.save()
      }

      return apiHandler({
        res,
        status: 'success',
        code: 200,
        message: 'Bulk TPS created successfully',
        data: insertedTps,
      })
    } catch (error) {
      console.error(error)
      return apiHandler({
        res,
        status: 'error',
        code: 500,
        message: 'Internal Server Error',
        error: { type: 'InternalServerError', details: error.message },
      })
    }
  },

  fillValidBallotsDetail: async (req, res) => {
    try {
      const { tpsId } = req.params
      const validBallotsDetail = req.body
      // Check if validBallotsDetail is an array and not empty
      if (
        !Array.isArray(validBallotsDetail) ||
        validBallotsDetail.length === 0
      ) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'Invalid or empty validBallotsDetail format',
          error: null,
        })
      }

      // Check tpsId
      if (!tpsId) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'Missing tpsId parameter',
          error: null,
        })
      }

      // Check if tps exists
      const tps = await Tps.findById(tpsId)
      if (!tps) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'TPS not found',
          error: null,
        })
      }

      // Validate existence of parties and candidates
      let totalVotesAllParties = 0 // Variable to track total votes for all parties

      for (const item of validBallotsDetail) {
        if (item.party_id) {
          const partyExists = await Party.findById(item.party_id)

          if (!partyExists) {
            return apiHandler({
              res,
              status: 'error',
              code: 400,
              message: `Party with ID ${item.party_id} not found`,
              error: null,
            })
          }

          // Add party details to the current item
          item.name = partyExists.name
          item.code = partyExists.code
          item.logo_url = partyExists.logo_url

          if (partyExists.candidates && partyExists.candidates.length > 0) {
            let totalVotesParty = 0

            for (const candidate of item.candidates) {
              const candidateId = new mongoose.Types.ObjectId(
                candidate?.candidate_id
              )
              const candidateExists = partyExists.candidates.find((c) =>
                c._id.equals(candidateId)
              )

              if (!candidateExists) {
                console.warn(
                  `Candidate with ID ${candidate?.candidate_id} not found for party ${item.party_id}. Skipping...`
                )

                // Skip to the next iteration if candidate is not found
                continue
              }

              // Add candidate details to the current item
              candidate.name = candidateExists.name
              candidate.gender = candidateExists.gender

              totalVotesParty += candidate.number_of_votes || 0
            }

            // Rest of the code for processing totalVotesParty
            // Add total votes for the party to the overall total
            totalVotesAllParties += totalVotesParty

            // Set total_votes_party for the party
            item.total_votes_party = totalVotesParty
          } else {
            return apiHandler({
              res,
              status: 'error',
              code: 400,
              message: `No candidates found for party ${item.party_id}`,
              error: null,
            })
          }
        }
      }

      // Check if total votes for all parties exceed maxVotes

      if (totalVotesAllParties > tps.total_voters) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: `Total votes for all parties exceed the maximum allowed votes, total votes for all parties: ${totalVotesAllParties}, max votes: ${tps.total_voters}`,
          error: null,
        })
      }

      // update  is_fillBallot in tps
      const updatedTps = await Tps.findOneAndUpdate(
        { _id: tpsId },
        {
          total_voters: tps.total_voters,
          valid_ballots_detail: validBallotsDetail,
          total_valid_ballots: totalVotesAllParties,
          total_invalid_ballots: tps.total_voters - totalVotesAllParties,
          is_fillBallot: true,
        }
      )
      // Create a history entry
      const historyEntry = {
        updated_at: new Date(),
        created_by: req.user._id,

        total_voters: tps.total_voters,
        valid_ballots_detail: validBallotsDetail,
        total_valid_ballots: totalVotesAllParties,
        total_invalid_ballots: tps.total_voters - totalVotesAllParties,
      }

      // Save the history entry to VotesResultHistory
      const history = await History.findOneAndUpdate(
        { tps_id: tpsId },
        {
          $push: { history: historyEntry },
        },
        { new: true, upsert: true }
      )

      // Return the updated document and history entry
      return apiHandler({
        res,
        status: 'success',
        code: 200,
        message: 'Valid ballots detail updated successfully',
        // send lash history
        data: history.history,

        error: null,
      })
    } catch (error) {
      console.error('Error filling valid_ballots_detail:', error)
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

  getAllTps: async (req, res) => {
    try {
      // Find all tps
      const tps = await Tps.find()
        .select('_id is_fillBallot village_id district_id number')
        .populate('village_id', 'name')
        .populate('district_id', 'name')

      // Transform the data
      const transformedTps = tps.map((tp) => ({
        _id: tp._id,
        number: tp.number,
        // village_id: tp.village_id._id,
        village_name: tp.village_id.name,
        // district_id: tp.district_id._id,
        district_name: tp.district_id.name,
        is_fillBallot: tp.is_fillBallot,
      }))

      // Return the transformed result
      return apiHandler({
        res,
        status: 'success',
        code: 200,
        message: 'Get all tps successfully',
        data: transformedTps,
        error: null,
      })
    } catch (error) {
      console.error('Error getting tps:', error)
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
  getAllTpsByDistrictId: async (req, res) => {
    const { districtId } = req.params
    try {
      // Find all tps
      const tps = await Tps.find({ district_id: districtId })
        .select('_id is_fillBallot village_id district_id number')
        .populate('village_id', 'name')
        .populate('district_id', 'name')

      // Transform the data
      const transformedTps = tps.map((tp) => ({
        _id: tp._id,
        number: tp.number,
        // village_id: tp.village_id._id,
        village_name: tp.village_id.name,
        // district_id: tp.district_id._id,
        district_name: tp.district_id.name,
        is_fillBallot: tp.is_fillBallot,
      }))

      // Return the transformed result
      return apiHandler({
        res,
        status: 'success',
        code: 200,
        message: 'Get all tps by district successfully',
        data: transformedTps,
        error: null,
      })
    } catch (error) {
      console.error('Error getting tps:', error)
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
  getAllTpsByVillageId: async (req, res) => {
    const { villageId } = req.params
    try {
      // Find all tps
      const tps = await Tps.find({ village_id: villageId })
        .select('_id is_fillBallot village_id district_id number')
        .populate('village_id', 'name')
        .populate('district_id', 'name')

      // Transform the data
      const transformedTps = tps.map((tp) => ({
        _id: tp._id,
        number: tp.number,
        // village_id: tp.village_id._id,
        village_name: tp.village_id.name,
        // district_id: tp.district_id._id,
        district_name: tp.district_id.name,
        is_fillBallot: tp.is_fillBallot,
      }))

      // Return the transformed result
      return apiHandler({
        res,
        status: 'success',
        code: 200,
        message: 'Get all tps successfully',
        data: transformedTps,
        error: null,
      })
    } catch (error) {
      console.error('Error getting tps:', error)
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
  getTpsById: async (req, res) => {
    const { tpsId } = req.params
    try {
      // Find all tps
      const tps = await Tps.findById(tpsId)
        .select(
          '_id is_fillBallot village_id district_id number valid_ballots_detail'
        )
        .populate('village_id', 'name')
        .populate('district_id', 'name')

      // Return the transformed result
      const transformedTps = {
        _id: tps._id,
        number: tps.number,
        // village_id: tps.village_id._id,
        village_name: tps.village_id.name,
        // district_id: tps.district_id._id,
        district_name: tps.district_id.name,
        is_fillBallot: tps.is_fillBallot,
        valid_ballots_detail: tps.valid_ballots_detail,
      }

      return apiHandler({
        res,
        status: 'success',
        code: 200,
        message: 'Get  tps successfully',
        data: transformedTps,
        error: null,
      })
    } catch (error) {
      console.error('Error getting tps:', error)
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

export default tpsController
