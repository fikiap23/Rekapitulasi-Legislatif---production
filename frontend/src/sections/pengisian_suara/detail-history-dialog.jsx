import React from 'react';
import PropTypes from 'prop-types';

import { Grid, List, Slide, AppBar, Button, Dialog, Toolbar, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';

import PartyCardV2 from './party-card_v2';

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function DetailHistory({ parties }) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  // console.log(parties);

  return (
    <>
      <Button onClick={handleClickOpen}>Lihat</Button>
      <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <Iconify icon="eva:arrow-ios-back-fill" onClick={handleClose} />
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Detail Riwayat Pengisian Suara
            </Typography>
          </Toolbar>
        </AppBar>
        <List>
          <Grid container spacing={2} mb={5}>
            {parties.map((party) => (
              <Grid item xs={12} sm={6} md={4} key={party._id}>
                <PartyCardV2 party={party} />
              </Grid>
            ))}
          </Grid>
        </List>
      </Dialog>
    </>
  );
}

DetailHistory.propTypes = {
  parties: PropTypes.array,
};
