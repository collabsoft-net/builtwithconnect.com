import { AbstractServiceController } from '@collabsoft-net/controllers';
import { PageDTO } from '@collabsoft-net/dto';
import { DefaultService, EventEmitter, QueryBuilder, Repository, SystemEvent } from '@collabsoft-net/types';
import { SearchRequest } from '@elastic/enterprise-search/lib/api/app/types';
import { AppDTO } from 'API/dto/AppDTO';
import { IndexedAppDTO } from 'API/dto/IndexedAppDTO';
import { App } from 'API/entities/App';
import { Tasks } from 'API/enums/Events';
import Injectables from 'API/Injectables';
import { AppService } from 'API/services/AppService';
import { SearchClientService } from 'API/services/SearchClientService';
import { StatusCodes } from 'http-status-codes';
import { inject } from 'inversify';
import { controller, httpDelete, httpGet, httpPost, requestBody, requestParam } from 'inversify-express-utils';

@controller('/api/apps')
export class AppsController extends AbstractServiceController<App, AppDTO, ConnectSession> {

  service: DefaultService<App, AppDTO>;

  constructor(
    @inject(Injectables.Repository) repository: Repository,
    @inject(Injectables.SearchClientService) private searcher: SearchClientService,
    @inject(Injectables.SearchIndexerService) private indexer: SearchClientService,
    @inject(Injectables.EventEmitter) private eventEmitter: EventEmitter
  ) {
    super();
    this.service = AppService.getInstance(repository);
  }

  @httpPost('/')
  async createSingle() {
    // Tasks can only be created by event handlers
    return this.statusCode(StatusCodes.NOT_IMPLEMENTED)
  }

  @httpPost('/search')
  async searchRequest(@requestBody() query: Pick<SearchRequest, 'body'>) {
    const result = await this.searcher.search(IndexedAppDTO, query);
    if (result) {
      return new PageDTO({
        ...result,
        values: result.values.map(this.service.toDTO)
      });
    }
    return  this.statusCode(StatusCodes.NOT_FOUND);
  }

  @httpPost('/bulk')
  async createBullk() {
    // Tasks can only be created by event handlers
    return this.statusCode(StatusCodes.NOT_IMPLEMENTED)
  }

  @httpGet('/reindex/:id?')
  async reindex(@requestParam('id') id?: string) {
    if (!id) {
      console.log('Starting re-index for all documents');
      await this.eventEmitter.emit(new SystemEvent(Tasks.ImportAppsTask));
    } else {
      const entity = await this.service.findById(id);
      if (entity) {
        console.log(`Reindexing document ${id}`, JSON.stringify(entity, null, 2));
        await this.indexer.index(new IndexedAppDTO(entity));
      } else {
        console.log(`Could not find document ${id} for re-indexing`);
      }
    }
    return this.statusCode(StatusCodes.NO_CONTENT);
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
