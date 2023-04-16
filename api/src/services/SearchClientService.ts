import { PageDTO } from '@collabsoft-net/dto';
import { Entity, Type } from '@collabsoft-net/types';
import { Client, ClientOptions } from '@elastic/enterprise-search';
import { SearchRequest } from '@elastic/enterprise-search/lib/api/app/types';
import { injectable } from 'inversify';

import { IndexedDTO } from '../dto/IndexedDTO';

@injectable()
export class SearchClientService {

  private client: Client;

  constructor(private engine: string, options: ClientOptions) {
    this.client = new Client(options);
  }

  async search<T extends Entity>(type: Type<IndexedDTO<T>>, query: Pick<SearchRequest, 'body'>): Promise<PageDTO<T>|null> {
    try {
      const { meta, results } = await this.client.app.search({
        engine_name: this.engine,
        ...query
      });

      const items = results.map((item: Record<string, Record<string, unknown>>) => {
        const indexedDTO = new type(JSON.parse(item.entity.raw as string));
        return indexedDTO.entity;
      });

      return new PageDTO<T>({
        start: ((meta.page.current * meta.page.size) - meta.page.size),
        size: meta.page.size,
        total: meta.page.total_results,
        values: items,
        last: meta.page.current === meta.page.total_pages
      });
    } catch (err) {
      return null;
    }
  }

  async index<T extends IndexedDTO<Entity>>(document: T): Promise<void> {
    try {

      const { engine, entity, ...fieldsToBeIndexed } = document;

      await this.client.app.indexDocuments({
        engine_name: engine || this.engine,
        documents: [{
          ...fieldsToBeIndexed,
          entity: JSON.stringify(entity)
        }]
      });

    } catch (err) {
      console.log('An error occurred while indexing/updating ElasticSearch', err);
      // Ignore this error.
      // Indexing is an idempotent operation
    }
  }

}