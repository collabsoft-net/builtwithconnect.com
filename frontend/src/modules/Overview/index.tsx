
import { Grid, Header, Page, Paragraph, Row } from '@collabsoft-net/components';
import React from 'react';
import { ConnectApps } from '../../components/Molecules/ConnectApps';
import Icon from '../../assets/icon.svg';
import Avatar from '@atlaskit/avatar';

export const Overview = () => (
  <Page padding='40px 0'>
    <Grid fluid padding="0 20px">
      <Row>
        <Grid>
          <Row>
            <Grid alignItems='center'>
              <Row>
                <Avatar src={ Icon } />
              </Row>
              <Row>
                <Header weight='h900'>State of Connect</Header>
              </Row>
              <Row margin="16px 0 0">
                <Paragraph>
                  Your daily updated overview of Connect apps as listed on the Atlassian Marketplace
                </Paragraph>
              </Row>
            </Grid>
          </Row>
        </Grid>
      </Row>
      <Row margin='16px 0'>
        <ConnectApps />
      </Row>
    </Grid>
  </Page>
);