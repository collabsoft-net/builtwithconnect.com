import { PageDTO } from '@collabsoft-net/dto';
import { AbstractRestClientService } from '@collabsoft-net/services';
import { DTO } from '@collabsoft-net/types';
import { SearchRequest } from '@elastic/enterprise-search/lib/api/app/types';

export class RestClientService extends AbstractRestClientService {

  async search<T extends DTO>(query: Pick<SearchRequest, 'body'>): Promise<PageDTO<T>> {
    const { data } = await this.client.post<PageDTO<T>>('/apps/search', query);
    return data;
  }

}