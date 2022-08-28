import {repository} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {StoredValue, KeyValuePair} from '../models';
import {StoredValueRepository} from '../repositories';

export class KeyValueController {
  constructor(
    @repository(StoredValueRepository)
    public storedValueRepository: StoredValueRepository,
  ) {}

  @post('/set')
  @response(204, {
    description: 'Value set successfully',
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(KeyValuePair),
        },
      },
    })
    keyValue: KeyValuePair,
  ): Promise<void> {
    return this.storedValueRepository.set(
      keyValue.key,
      new StoredValue({value: keyValue.value}),
    );
  }

  @get('/get/{key}')
  @response(200, {
    description: 'StoredValue model count',
    content: {'text/plain': {schema: {type: 'string'}}},
  })
  async find(@param.path.string('key') key: string): Promise<string> {
    const result = await this.storedValueRepository.get(key);
    if (result) {
      return result.value;
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
    let result: AsyncIterable<string>;
    if (prefix && !suffix) {
      result = this.storedValueRepository.keys({
        match: `${prefix}*`,
      });
    } else if (suffix && !prefix) {
      result = this.storedValueRepository.keys({
        match: `*${suffix}`,
      });
    } else if (prefix && suffix) {
      result = this.storedValueRepository.keys({
        match: `${prefix}*${suffix}`,
      });
    } else {
      throw new HttpErrors.BadRequest(
        'No prefix or suffix provided to search for.',
      );
    }

    const res = [];
    for await (const key of result) {
      res.push(key);
    }
    return res;
  }
}
