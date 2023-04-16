import { App } from '../entities/App';
import { IndexedDTO } from './IndexedDTO';


export class IndexedAppDTO extends IndexedDTO<App> {

  engine = 'apps';

  name: string;
  partner: string;
  hosting: Array<'CLOUD'|'SERVER'|'DATA_CENTER'>;
  host: Array<'confluence'|'jira'>;
  paid: boolean;
  scopes: number;
  installs: number;
  users: number;

  constructor(public entity: App) {
    super(entity.id)

    this.name = entity.name,
    this.partner = entity.partnerName,
    this.hosting = entity.hosting;
    this.host = entity.host;
    this.paid = entity.isPaid;
    this.scopes = entity.scopes.length;
    this.installs = entity.totalInstalls;
    this.users = entity.totalUsers;
  }

  fromEntity(entity: App): IndexedAppDTO {
    return new IndexedAppDTO(entity);
  }

}