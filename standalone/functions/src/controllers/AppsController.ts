import { AbstractServiceController } from '@collabsoft-net/controllers';
import { DefaultService, QueryBuilder, Repository } from '@collabsoft-net/types';
import { AppDTO } from 'API/dto/AppDTO';
import { App } from 'API/entities/App';
import Injectables from 'API/Injectables';
import { AppService } from 'API/services/AppService';
import { StatusCodes } from 'http-status-codes';
import { inject } from 'inversify';
import { controller, httpDelete, httpGet, httpPost, requestParam } from 'inversify-express-utils';

@controller('/api/apps')
export class AppsController extends AbstractServiceController<App, AppDTO, ConnectSession> {

  service: DefaultService<App, AppDTO>;

  constructor(@inject(Injectables.Repository) repository: Repository) {
    super();
    this.service = AppService.getInstance(repository);
  }

  @httpPost('/')
  async createSingle() {
    // Tasks can only be created by event handlers
    return this.statusCode(StatusCodes.NOT_IMPLEMENTED)
  }

  @httpPost('/bulk')
  async createBullk() {
    // Tasks can only be created by event handlers
    return this.statusCode(StatusCodes.NOT_IMPLEMENTED)
  }

  @httpGet('/:id?')
  async readRequest(@requestParam('id') id?: string) {
    return super.read(id);
  }

  @httpPost('/:id')
  async updateRequest() {
    // Tasks can only be updated by event handlers
    return this.statusCode(StatusCodes.NOT_IMPLEMENTED)
  }

  @httpDelete('/:id')
  async deleteRequest() {
    // Tasks are automatically deleted by a scheduled task
    return this.statusCode(StatusCodes.NOT_IMPLEMENTED)
  }

  protected toQuery(key: string, value: string | number | boolean, query: QueryBuilder): QueryBuilder {
    if (key === 'limit') {
      query = query.limit(Number(value)).orderBy('id', 'asc');
      const offset = this.httpContext.request.query['offset'];
      if (offset && typeof offset === 'string') {
        query.where('id', '>', offset);
      }
      return query;
    }
    return this.defaultQuery(key, value, query);
  }

  protected getDirection(direction: string): 'asc'|'desc' {
    return (direction && direction.toLowerCase() === 'desc') ? 'desc' : 'asc';
  }

}
