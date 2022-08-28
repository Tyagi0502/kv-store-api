import {
  post,
  param,
  get,
  getModelSchemaRef,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {numberOfKeysInDatabase} from '../metrics';
import {KeyValuePair} from '../models';

export class KeyValueController {
  constructor() {}

  @post('/set')
  @response(204, {
    description: 'Value set successfully',
  })
  async set(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(KeyValuePair),
        },
      },
    })
    keyValue: KeyValuePair,
  ): Promise<void> {
    kvPairs.set(keyValue.key, keyValue.value);
    numberOfKeysInDatabase.set(kvPairs.size);
  }

  @get('/get/{key}')
  @response(200, {
    description: 'StoredValue model count',
    content: {'text/plain': {schema: {type: 'string'}}},
  })
  async find(@param.path.string('key') key: string): Promise<string> {
    const value = kvPairs.get(key);

    if (value) {
      return value;
    } else {
      throw new HttpErrors.NotFound(`No value found for key --> ${key}`);
    }
  }

  @get('/search')
  @response(200, {
    description: 'Search Result',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {type: 'string'},
        },
      },
    },
  })
  async search(
    @param.query.string('prefix') prefix?: string,
    @param.query.string('suffix') suffix?: string,
  ): Promise<string[]> {
    const keys = kvPairs.keys();

    let result: string[];
    if (prefix && !suffix) {
      result = [...filterPrefix(keys, prefix)];
    } else if (suffix && !prefix) {
      result = [...filterSuffix(keys, suffix)];
    } else if (prefix && suffix) {
      result = [...filterPrefixSuffix(keys, prefix, suffix)];
    } else {
      throw new HttpErrors.BadRequest(
        'No prefix or suffix provided to search for.',
      );
    }
    return result;
  }
}

const kvPairs = new Map<string, string>();

function* filterPrefix(
  iterable: IterableIterator<string>,
  prefix: string,
): IterableIterator<string> {
  for (const item of iterable) if (item.startsWith(prefix)) yield item;
}

function* filterSuffix(
  iterable: IterableIterator<string>,
  suffix: string,
): IterableIterator<string> {
  for (const item of iterable) if (item.endsWith(suffix)) yield item;
}

function* filterPrefixSuffix(
  iterable: IterableIterator<string>,
  prefix: string,
  suffix: string,
): IterableIterator<string> {
  for (const item of iterable)
    if (item.startsWith(prefix) && item.endsWith(suffix)) yield item;
}
