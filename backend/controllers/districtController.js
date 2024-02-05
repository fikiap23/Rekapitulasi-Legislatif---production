import District from '../models/districtModel.js'

import apiHandler from '../utils/apiHandler.js'
const districtController = {
  createNewDistrict: async (req, res) => {
    try {
      const { name, code } = req.body

      if (!name || !code) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'Missing required fields',
          error: null,
        })
      }

      // Check if district already exists
      const existingDistrict = await District.findOne({ code })
      if (existingDistrict) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'District already exists',
          error: null,
        })
      }

      const newDistrict = new District({
        name,

        code,
      })

      await newDistrict.save()

      return apiHandler({
        res,
        status: 'success',
        code: 201,
        message: 'District created successfully',
        data: {
          _id: newDistrict._id,
          name: newDistrict.name,
          regency_id: newDistrict.regency_id,
          code: newDistrict.code,
        },
        error: null,
      })
    } catch (error) {
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

  bulkDistricts: async (req, res) => {
    try {
      const districtsData = req.body

      if (
        !districtsData ||
        !Array.isArray(districtsData) ||
        districtsData.length === 0
      ) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'Invalid or missing districts data',
          error: null,
        })
      }

      // Check if any of the districts already exist
      const existingDistricts = await District.find({
        code: { $in: districtsData.map((district) => district.code) },
      })

      if (existingDistricts.length > 0) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'One or more districts already exist',
          error: null,
        })
      }

      const createdDistricts = await District.insertMany(
        districtsData.map((district) => ({ ...district }))
      )

      return apiHandler({
        res,
        status: 'success',
        code: 201,
        message: 'Districts created successfully',
        data: createdDistricts,
        error: null,
      })
    } catch (error) {
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
  getAllDistricts: async (req, res) => {
    try {
      const allDistricts = await District.find()
        .select('_id name code villages')
        .populate('villages', 'name')

      return apiHandler({
        res,
        status: 'success',
        code: 200,
        message: 'All districts retrieved successfully',
        data: allDistricts,
        error: null,
      })
    } catch (error) {
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

  getAllDistrictNames: async (req, res) => {
    try {
      const allDistricts = await District.find().select('_id name')

      return apiHandler({
        res,
        status: 'success',
        code: 200,
        message: 'All districts retrieved successfully',
        data: allDistricts,
        error: null,
      })
    } catch (error) {
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

export default districtController
