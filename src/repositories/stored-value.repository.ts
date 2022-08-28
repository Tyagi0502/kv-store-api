import {inject} from '@loopback/core';
import {DefaultKeyValueRepository} from '@loopback/repository';
import {KeyValueDataSource} from '../datasources';
import {StoredValue} from '../models';

export class StoredValueRepository extends DefaultKeyValueRepository<StoredValue> {
  constructor(@inject('datasources.KeyValue') dataSource: KeyValueDataSource) {
    super(StoredValue, dataSource);
  }
}
