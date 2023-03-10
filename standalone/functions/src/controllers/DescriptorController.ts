import { AbstractController } from '@collabsoft-net/controllers';
import { controller, httpGet } from 'inversify-express-utils';

import { Confluence } from '../descriptors/confluence';
//import { Jira } from '../descriptors/jira';

@controller('/descriptors')
export class DescriptorController extends AbstractController<ConnectSession> {

  @httpGet('/confluence/atlassian-connect.json')
  async getConfluenceDescriptor(): Promise<unknown> {
    return Confluence;
  }

  //@httpGet('/jira/atlassian-connect.json')
  //async getJiraDescriptor(): Promise<unknown> {
  //  return Jira;
  //}

}