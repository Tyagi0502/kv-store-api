import {Model, model, property} from '@loopback/repository';

@model()
export class KeyValuePair extends Model {
  @property()
  key: string;

  @property()
  value: string;

  constructor(data?: Partial<KeyValuePair>) {
    super(data);
  }
}
