import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useRecoilValue } from 'recoil';
import React, { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import { IconButton, InputLabel } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import userAtom from 'src/atoms/userAtom';
import tpsService from 'src/services/tpsService';
import userService from 'src/services/userService';
import villageService from 'src/services/villageService';
import districtService from 'src/services/districtService';

import Iconify from 'src/components/iconify';

export default function EditUserDialog({ user }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username,
    password: '',
    kecamatan: '',
    role: user.role,
    district_id: user.district_id || '',
    village_id: user.village_id || '',
    tps_id: user.tps_id || '',
  });
  const currentUser = useRecoilValue(userAtom);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [kecamatans, setKecamatans] = useState([]);
  const [kelurahans, setKelurahans] = useState([]);
  const [tpsList, setTpsList] = useState([]);
  console.log(formData);
  useEffect(() => {
    const handleGetKecamatans = async () => {
      if (currentUser.role === 'admin') {
        const getKecamatans = await districtService.getAllDistrictNames();
        if (getKecamatans.code === 200) {
          setKecamatans(getKecamatans.data);
        } else {
          setKecamatans([]);
        }
      }
    };
    handleGetKecamatans();
  }, [currentUser]);

  useEffect(() => {
    const handleGetKelurahan = async () => {
      const getKelurahan = await villageService.getAllVillageByDistrictId(formData.district_id);
      if (getKelurahan.code === 200) {
        setKelurahans(getKelurahan.data);
      } else {
        setKelurahans([]);
      }
    };

    handleGetKelurahan();
  }, [formData.district_id]);

  useEffect(() => {
    const handleGetTps = async () => {
      const getTps = await tpsService.getAllTpsByVillageId(formData.village_id);
      if (getTps.data) {
        setTpsList(getTps.data);
      } else {
        setTpsList([]);
      }
    };

    handleGetTps();
  }, [formData.village_id]);

  const handleEditUser = async () => {
    try {
      setLoading(true);

      if (formData.role === 'user_tps') {
        formData.district_id = '';
        formData.village_id = '';
        formData.kecamatan = '';
        // console.log(formData);
      } else {
        formData.district_id = '';
        formData.village_id = '';
        formData.kecamatan = '';
        formData.tps_id = '';
        // console.log(formData);
      }

      const result = await userService.editUser(user._id, formData);

      if (result.code === 200) {
        enqueueSnackbar('Edit success', {
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
        setLoading(false);
        window.location.reload();
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
        setLoading(false);
      }
    } catch (error) {
      enqueueSnackbar('Edit failed', {
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
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <MenuItem onClick={handleClickOpen}>
        <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
        Edit
      </MenuItem>
      <Dialog maxWidth="xs" fullWidth open={open} onClose={handleClose}>
        <DialogTitle>Edit akun </DialogTitle>

        {currentUser.role === 'admin' && (
          <DialogContent>
            <TextField
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              autoFocus
              defaultValue={user.username}
              margin="dense"
              id="username"
              name="username"
              label="Username"
              type="text"
              fullWidth
              variant="standard"
            />

            <TextField
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              margin="dense"
              id="password"
              name="password"
              label="Password"
              type="password"
              fullWidth
              variant="standard"
            />

            <div style={{ marginTop: '16px' }}>
              <InputLabel id="role-label">Peran</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formData.role}
                onChange={(e) => {
                  setFormData({ ...formData, role: e.target.value, kecamatan: '', village_id: '' });
                }}
                fullWidth
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="user_tps">Petugas TPS</MenuItem>
              </Select>
            </div>

            {formData.role === 'user_tps' && (
              <>
                <div style={{ marginTop: '16px' }}>
                  <InputLabel id="kecamatan-label">Kecamatan</InputLabel>
                  <Select
                    labelId="kecamatan-label"
                    id="kecamatan"
                    name="kecamatan"
                    value={formData.district_id}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        district_id: e.target.value,
                      });

                      // setKelurahans(e.target.value.villages);
                    }}
                    fullWidth
                  >
                    {kecamatans.map((kecamatan) => (
                      <MenuItem key={kecamatan._id} value={kecamatan._id}>
                        {kecamatan.name}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <InputLabel id="kelurahan-label">Kelurahan</InputLabel>
                  <Select
                    disabled={!formData.district_id}
                    labelId="kelurahan-label"
                    id="kelurahan"
                    name="kelurahan"
                    value={formData.village_id}
                    onChange={async (e) => {
                      setFormData({ ...formData, village_id: e.target.value });
                    }}
                    fullWidth
                  >
                    {kelurahans.map((kelurahan) => (
                      <MenuItem key={kelurahan._id} value={kelurahan._id}>
                        {kelurahan.name}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <InputLabel id="kelurahan-label">TPS</InputLabel>
                  <Select
                    disabled={!formData.village_id}
                    labelId="tps-label"
                    id="tps"
                    name="tps"
                    value={formData.tps_id}
                    onChange={async (e) => {
                      setFormData({ ...formData, tps_id: e.target.value });
                    }}
                    fullWidth
                  >
                    {tpsList.map((tp) => (
                      <MenuItem key={tp._id} value={tp._id}>
                        {tp.number}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
              </>
            )}
          </DialogContent>
        )}

        <DialogActions>
          <Button onClick={handleClose}>Batal</Button>
          <Button onClick={handleEditUser}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

EditUserDialog.propTypes = {
  user: PropTypes.any,
};
