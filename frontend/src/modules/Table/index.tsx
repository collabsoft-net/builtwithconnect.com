import { Grid, Page, Row } from '@collabsoft-net/components';
import React from 'react';
import { ConnectApps } from '../../components/Molecules/ConnectApps';

export const Table = () => (
  <Page padding='40px 0'>
    <Grid fluid padding="0 20px">
      <Row>
        <ConnectApps />
      </Row>
    </Grid>
  </Page>
);