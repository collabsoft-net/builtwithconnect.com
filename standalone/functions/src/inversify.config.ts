import './environment';
import 'reflect-metadata';

import { PubSubEmitter } from '@collabsoft-net/emitters';
import { getFirebaseAdminOptions, PubSubHandlers, ScheduledPubSubHandlers } from '@collabsoft-net/functions';
import { isProduction } from '@collabsoft-net/helpers';
import { FirebaseAdminRepository } from '@collabsoft-net/repositories';
import { EventEmitter, PubSubHandler, Repository, ScheduledPubSubHandler } from '@collabsoft-net/types';
import Injectables from 'API/Injectables';
import { SearchClientService } from 'API/services/SearchClientService';
import { logger } from 'firebase-functions';
import { Container } from 'inversify';

import { ImportAppsScheduledTask } from './scheduledTasks/ImportAppsScheduledTask';
import { ImportAppsTask } from './tasks/ImportAppsTask';
import { ImportAppTask } from './tasks/ImportAppTask';

if (!isProduction() && process.env.FB_ADMINKEY) {
  logger.info('You are running Firebase Cloud Functions using local environment variables');
}

if (!process.env.SEARCH_URL) throw new Error('Required environment variable "SEARCH_URL" is missing or undefined');
if (!process.env.SEARCH_TOKEN) throw new Error('Required environment variable "SEARCH_TOKEN" is missing or undefined');
if (!process.env.INDEX_TOKEN) throw new Error('Required environment variable "INDEX_TOKEN" is missing or undefined');

const container = new Container();

// ------------------------------------------------------------------------------------------ Bindings

// ------------------------------------------------------------------------------------------ Bindings :: API

container.bind<Repository>(Injectables.Repository).toConstantValue(
  new FirebaseAdminRepository(process.env.FB_PROJECTID || 'connect-report-app', getFirebaseAdminOptions())
);

container.bind<EventEmitter>(Injectables.EventEmitter).toConstantValue(new PubSubEmitter({
  projectId: process.env.FB_PROJECTID || 'connect-report-app',
  apiKey: process.env.FB_ADMINKEY
}));

container.bind<SearchClientService>(Injectables.SearchClientService).toConstantValue(new SearchClientService('apps', {
  url: process.env.SEARCH_URL,
  auth: {
    token: process.env.SEARCH_TOKEN
  }
}));

container.bind<SearchClientService>(Injectables.SearchIndexerService).toConstantValue(new SearchClientService('apps', {
  url: process.env.SEARCH_URL,
  auth: {
    token: process.env.INDEX_TOKEN
  }
}));

// ------------------------------------------------------------------------------------------ Bindings :: Tasks

container.bind<PubSubHandler>(PubSubHandlers).to(ImportAppTask);
container.bind<PubSubHandler>(PubSubHandlers).to(ImportAppsTask);

// ------------------------------------------------------------------------------------------ Bindings :: Scheduled Tasks

if (isProduction()) {
  container.bind<ScheduledPubSubHandler>(ScheduledPubSubHandlers).to(ImportAppsScheduledTask);
}

// ------------------------------------------------------------------------------------------ Export

export { container };