import District from '../models/districtModel.js'
import Village from '../models/villageModel.js'
import apiHandler from '../utils/apiHandler.js'

const villageController = {
  createOneVillage: async (req, res) => {
    try {
      const { name, code, total_voters, district_id } = req.body

      if (!name || !total_voters || !district_id || !code) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'Missing required fields',
          error: null,
        })
      }

      const district = await District.findById(district_id)
      if (!district) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'District not found',
          error: null,
        })
      }

      // Check if code already exists
      const existingVillage = await Village.findOne({ code })
      if (existingVillage) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'Village already exists',
          error: null,
        })
      }

      const newVillage = new Village({
        name,
        code,
        district_id,
        total_voters,
      })

      await newVillage.save()

      district.villages.push(newVillage._id)
      await district.save()

      return apiHandler({
        res,
        status: 'success',
        code: 201,
        message: 'Village created successfully',
        data: {
          _id: newVillage._id,
          code: newVillage.code,
          district_id: newVillage.district_id,
          name: newVillage.name,
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

  createBulkVillages: async (req, res) => {
    try {
      const villagesData = req.body

      if (!villagesData || !Array.isArray(villagesData)) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'Invalid villages data format',
          error: null,
        })
      }

      // Ambil semua district_code dari villagesData
      const districtCodesSet = new Set(
        villagesData.map((village) => village.district_code)
      )
      const districtCodes = Array.from(districtCodesSet)

      // Periksa apakah semua district_code ada di database
      const districtsExist = await District.find({
        code: { $in: districtCodes },
      })

      // Jika ada district_code yang tidak ditemukan, kembalikan respons error
      if (districtCodes.length !== districtsExist.length) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'One or more districts not found',
          error: null,
        })
      }

      const villageCodes = villagesData.map((village) => village.code)

      const foundVillages = await Village.find({ code: { $in: villageCodes } })

      if (foundVillages.length > 0) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'One or more villages already exist',
          error: null,
        })
      }

      // add district_id to each village
      villagesData.forEach((village) => {
        village.district_id = districtsExist.find(
          (district) => district.code === village.district_code
        )._id
      })

      // Semua distrik ditemukan, lanjutkan dengan menyimpan desa
      const createdVillages = await Village.insertMany(villagesData)

      // Loop melalui setiap desa dan tambahkan _id desa ke array villages di masing-masing distrik
      for (const village of createdVillages) {
        const district = districtsExist.find(
          (d) => d.code.toString() === village.district_code.toString()
        )
        district.villages.push(village._id)
        await district.save()
      }

      return apiHandler({
        res,
        status: 'success',
        code: 201,
        message:
          'Bulk villages created and associated with districts successfully',
        data: createdVillages,
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

  createBulkVillagesByDistrict: async (req, res) => {
    try {
      const villagesData = req.body
      const { district_id } = req.params

      if (!district_id || !villagesData || !Array.isArray(villagesData)) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'Invalid request format',
          error: null,
        })
      }

      const district = await District.findById(district_id)
      if (!district) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'District not found',
          error: null,
        })
      }

      // Menambahkan district_id ke setiap objek desa
      const villagesWithDistrictId = villagesData.map((village) => ({
        ...village,
        district_id,
      }))

      const villageIds = villagesData.map((village) => village.code)

      const foundVillages = await Village.find({
        code: { $in: villageIds },
      })

      if (foundVillages.length > 0) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'One or more villages already exist',
          error: null,
        })
      }

      const createdVillages = await Village.insertMany(villagesWithDistrictId)

      createdVillages.forEach((village) => {
        district.villages.push(village._id)
      })

      await district.save()

      return apiHandler({
        res,
        status: 'success',
        code: 201,
        message:
          'Bulk villages created and associated with the district successfully',
        data: createdVillages,
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

  getAllVillageByDistrictId: async (req, res) => {
    try {
      const { district_id } = req.params

      if (!district_id) {
        return apiHandler({
          res,
          status: 'error',
          code: 400,
          message: 'Invalid district ID',
          error: null,
        })
      }

      // Check if the district exists
      const district = await District.findById(district_id)
      if (!district) {
        return apiHandler({
          res,
          status: 'error',
          code: 404,
          message: 'District not found',
          error: null,
        })
      }

      const villages = await Village.find({ district_id: district_id })
        .select('_id code name district_id')
        .populate('district_id', 'name')

      // Modify the structure of each village object
      const modifiedVillages = villages.map((village) => ({
        _id: village._id,
        name: village.name,
        code: village.code,
        district_id: village.district_id._id,
        district_name: village.district_id.name,
      }))

      return apiHandler({
        res,
        status: 'success',
        code: 200,
        message: 'Villages for the specified district retrieved successfully',
        data: modifiedVillages,
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
  getAllVillages: async (req, res) => {
    try {
      const villages = await Village.find({})
        .select('_id code village_name district_id')
        .populate('district_id', 'name')

      // Modify the structure of each village object
      const modifiedVillages = villages.map((village) => ({
        _id: village._id,
        village_name: village.village_name,
        code: village.code,
        district_id: village.district_id._id,
        district_name: village.district_id.name,
      }))

      return apiHandler({
        res,
        status: 'success',
        code: 200,
        message: 'All villages retrieved successfully',
        data: modifiedVillages,
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

export default villageController
