import { DTO, Entity } from '@collabsoft-net/types';



export abstract class IndexedDTO<T extends Entity> extends DTO implements Entity {

  abstract get engine(): string;
  abstract get entity(): T;

  constructor(public id: string) {
    super(id);
  }

  abstract fromEntity(entity: T): IndexedDTO<T>;

}