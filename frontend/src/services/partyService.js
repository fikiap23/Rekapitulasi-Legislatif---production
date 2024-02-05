import axios from 'axios';

const BASE_URL = '/api/parties';

const partyService = {
  getAllParties: async () => {
    try {
      const response = await axios.get(`${BASE_URL}`, {
        withCredentials: true,
      });

      return response.data.data;
    } catch (error) {
      return error.response.data;
    }
  },
  getAllPartiesWithcandidates: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/candidates`, {
        withCredentials: true,
      });

      return response.data.data;
    } catch (error) {
      return error.response.data;
    }
  },
};

export default partyService;
