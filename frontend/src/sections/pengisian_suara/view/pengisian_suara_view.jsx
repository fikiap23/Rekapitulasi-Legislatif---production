import { useRecoilValue } from 'recoil';
import { useSnackbar } from 'notistack';
import { useState, useEffect } from 'react';

import Container from '@mui/material/Container';
import {
  Grid,
  Table,
  Paper,
  Button,
  MenuItem,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  Accordion,
  Typography,
  IconButton,
  TableContainer,
  LinearProgress,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import userAtom from 'src/atoms/userAtom';
import tpsService from 'src/services/tpsService';
import partyService from 'src/services/partyService';
import historyService from 'src/services/historyService';
import districtService from 'src/services/districtService';

import Iconify from 'src/components/iconify';

import PartyCard from '../party-card';
import DetailHistory from '../detail-history-dialog';

// ----------------------------------------------------------------------

export default function PengisianSuaraView() {
  const user = useRecoilValue(userAtom);
  const [kecamatan, setKecamatan] = useState('');
  const [kelurahan, setKelurahan] = useState('');
  const [tps, setTps] = useState('');
  const [parties, setParties] = useState([]);
  const [kecamatans, setKecamatans] = useState([]);
  const [kelurahans, setKelurahans] = useState([]);
  const [tpsList, setTpsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [votesResult, setVotesResult] = useState([]);
  const [history, setHistory] = useState([]);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  function convertDateFormat(originalDateString) {
    const originalDate = new Date(originalDateString);

    const year = originalDate.getFullYear();
    const month = String(originalDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(originalDate.getDate()).padStart(2, '0');

    const hours = String(originalDate.getHours()).padStart(2, '0');
    const minutes = String(originalDate.getMinutes()).padStart(2, '0');
    const seconds = String(originalDate.getSeconds()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return formattedDate;
  }
  useEffect(() => {
    const handleGetAllParties = async () => {
      try {
        setLoading(true);
        const result = await partyService.getAllPartiesWithcandidates();

        setParties(result);

        setLoading(false);
      } catch (error) {
        setKecamatans([]);
        setParties([]);
        setLoading(false);
      }
    };
    handleGetAllParties();
  }, []);

  useEffect(() => {
    const handleGetAllDistricts = async () => {
      try {
        setLoading(true);

        if (user.role === 'admin') {
          const getKecamatans = await districtService.getAllDistricts();
          setKecamatans(getKecamatans.data);
        } else if (user.role === 'user_tps') {
          const getTps = await tpsService.getTpsById(user.tps_id);
          const getHistory = await historyService.getAllHistoryByTps(user.tps_id);
          // console.log(getHistory.data);
          setHistory(getHistory.data);
          setTps(getTps.data);
        }

        setLoading(false);
      } catch (error) {
        setKecamatans([]);
        setParties([]);
        setLoading(false);
      }
    };
    handleGetAllDistricts();
  }, [user.role, user.tps_id]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      let result;
      if (user.role === 'admin') {
        if (tps === '') {
          enqueueSnackbar('Please select tps', {
            variant: 'error',
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'center',
            },
            action: (key) => (
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={() => closeSnackbar(key)}
              >
                <Iconify icon="eva:close-fill" />
              </IconButton>
            ),
          });
          setLoading(false);
          return;
        }

        result = await tpsService.fillBallots(tps, votesResult);
      } else if (user.role === 'user_tps') {
        result = await tpsService.fillBallots(user.tps_id, votesResult);
      }

      if (result.code === 200) {
        setHistory(result.data);
        enqueueSnackbar('Voting success', {
          variant: 'success',
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
          },
          action: (key) => (
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={() => closeSnackbar(key)}
            >
              <Iconify icon="eva:close-fill" />
            </IconButton>
          ),
        });
      } else {
        enqueueSnackbar(result.message, {
          variant: 'error',
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
          },
          action: (key) => (
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={() => closeSnackbar(key)}
            >
              <Iconify icon="eva:close-fill" />
            </IconButton>
          ),
        });
      }

      setLoading(false);
    } catch (error) {
      setVotesResult([]);
      setLoading(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Formulir Pengisian Suara
      </Typography>
      {loading && <LinearProgress color="primary" variant="query" />}
      {!loading && (
        <>
          {history.length > 0 && (
            <Grid container spacing={3} mb={5}>
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ mb: 3 }} color="primary.main">
                  Riwayat Pengisian Suara
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Tanggal</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.map((item, index) => (
                        <TableRow key={item._id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{convertDateFormat(item.updated_at)}</TableCell>
                          <TableCell>{item.created_by.username}</TableCell>
                          <TableCell>
                            <DetailHistory parties={item.valid_ballots_detail} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}

          {user.role === 'user_tps' && (
            <>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Input suara sah di Kelurahan {tps.village_name} - {tps.number}
              </Typography>
              <Grid container spacing={2} mb={5}>
                {parties.map((party) => (
                  <Grid item xs={12} sm={6} md={4} key={party._id}>
                    <PartyCard party={party} setVotesResult={setVotesResult} />
                  </Grid>
                ))}
              </Grid>
              <Grid item xs={12} mb={5}>
                <Button type="button" variant="contained" color="primary" onClick={handleSubmit}>
                  Submit
                </Button>
              </Grid>
            </>
          )}

          {user.role === 'admin' && (
            <Accordion>
              <AccordionSummary
                expandIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography variant="h5" color="primary.main">
                  Input Suara Sah
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3} mb={5}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Kecamatan"
                      value={kecamatan}
                      onChange={(e) => {
                        setKecamatan(e.target.value);
                        setKelurahans(e.target.value.villages);
                        // console.log(e.target.value);
                      }}
                      variant="outlined"
                    >
                      <MenuItem value="" disabled>
                        Pilih Kecamatan
                      </MenuItem>
                      {kecamatans.map((option) => (
                        <MenuItem key={option._id} value={option}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Kelurahan"
                      value={kelurahan}
                      onChange={async (e) => {
                        setHistory([]);
                        setKelurahan(e.target.value);
                        // console.log(e.target.value);
                        const getTps = await tpsService.getAllTpsByVillageId(e.target.value);
                        if (getTps.data) {
                          setTpsList(getTps.data);
                        }
                        // console.log(getTps);
                      }}
                      variant="outlined"
                      disabled={!kecamatan}
                    >
                      <MenuItem value="" disabled>
                        Pilih Desa / Kelurahan
                      </MenuItem>
                      {kelurahans.map((option) => (
                        <MenuItem key={option._id} value={option._id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="TPS"
                      value={tps}
                      onChange={async (e) => {
                        setHistory([]);
                        setTps(e.target.value);
                        // console.log(getHistory.data);
                        const getHistory = await historyService.getAllHistoryByTps(e.target.value);
                        if (getHistory.data) {
                          setHistory(getHistory.data);
                        }
                      }}
                      variant="outlined"
                      disabled={!kelurahan}
                    >
                      <MenuItem value="" disabled>
                        Pilih TPS
                      </MenuItem>
                      {tpsList.map((option) => (
                        <MenuItem key={option._id} value={option._id}>
                          {option.number}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
                <Grid container spacing={2} mb={5}>
                  {parties.map((party) => (
                    <Grid item xs={12} sm={6} md={4} key={party._id}>
                      <PartyCard party={party} setVotesResult={setVotesResult} />
                    </Grid>
                  ))}
                </Grid>
                <Grid item xs={12} mb={5}>
                  <Button type="button" variant="contained" color="primary" onClick={handleSubmit}>
                    Submit
                  </Button>
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}
        </>
      )}
    </Container>
  );
}
