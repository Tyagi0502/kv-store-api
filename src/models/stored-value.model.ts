import {Entity, model, property} from '@loopback/repository';

@model()
export class StoredValue extends Entity {
  @property({
    type: 'string',
    required: true,
  })
  value: string;

  constructor(data?: Partial<StoredValue>) {
    super(data);
  }
}

export interface StoredValueRelations {
  // describe navigational properties here
}

export type StoredValueWithRelations = StoredValue & StoredValueRelations;
