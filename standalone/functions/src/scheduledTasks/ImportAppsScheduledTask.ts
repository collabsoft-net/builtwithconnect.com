/* eslint-disable @typescript-eslint/no-explicit-any */

import { AbstractScheduledPubSubHandler } from '@collabsoft-net/functions';
import { EventEmitter, SystemEvent } from '@collabsoft-net/types';
import { ScheduledTasks,Tasks } from 'API/enums/Events';
import Injectables from 'API/Injectables';
import { inject, injectable } from 'inversify';

@injectable()
export class ImportAppsScheduledTask extends AbstractScheduledPubSubHandler {

  name = ScheduledTasks.ImportAppsScheduledTask;
  schedule = '0 0 * * *';

  constructor(
    @inject(Injectables.EventEmitter) private eventEmitter: EventEmitter
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.eventEmitter.emit(new SystemEvent(Tasks.ImportAppsTask));
  }

  protected async timeoutImminent(): Promise<void> {
    // IGNORE THIS FOR NOW
  }

}