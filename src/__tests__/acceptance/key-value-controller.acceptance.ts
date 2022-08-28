import {Client, expect} from '@loopback/testlab';
import {KeyValueStoreApplication} from '../..';
import {setupApplication} from './test-helper';

describe('KeyValueController', () => {
  let app: KeyValueStoreApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('should throw NotFound error when /get/{key} is invoked for an invalid key', async () => {
    await client.get('/get/abc-1').expect(404);
  });

  it('should save values to the store when /set is invoked', async () => {
    await client.post('/set').send({key: 'abc-1', value: '1'}).expect(204);
    await client.post('/set').send({key: 'abc-2', value: '2'}).expect(204);
    await client.post('/set').send({key: 'xyz-1', value: '3'}).expect(204);
    await client.post('/set').send({key: 'xyz-2', value: '4'}).expect(204);
  });

  it('should return correct value when /get/{key} is invoked for a valid key', async () => {
    const res = await client.get('/get/abc-1').expect(200);
    expect(res.text).to.equal('1');
  });

  it('should return a valid array when /search is invoked for a valid prefix', async () => {
    const res = await client.get('/search').query({prefix: 'abc'}).expect(200);
    expect(res.body).to.be.an.Array();
    expect(res.body.length).to.be.equal(2);
    expect(res.body[0]).to.be.equal('abc-1');
    expect(res.body[1]).to.be.equal('abc-2');
  });

  it('should return a valid array when /search is invoked for a valid suffix', async () => {
    const res = await client.get('/search').query({suffix: '-1'}).expect(200);
    expect(res.body).to.be.an.Array();
    expect(res.body.length).to.be.equal(2);
    expect(res.body[0]).to.be.equal('abc-1');
    expect(res.body[1]).to.be.equal('xyz-1');
  });

  it('should return a valid array when /search is invoked for a valid prefix & suffix', async () => {
    const res = await client
      .get('/search')
      .query({prefix: 'xy', suffix: '-2'})
      .expect(200);
    expect(res.body).to.be.an.Array();
    expect(res.body.length).to.be.equal(1);
    expect(res.body[0]).to.be.equal('xyz-2');
  });

  it('should throw BadRequest error when /search is invoked without a valid prefix or suffix', async () => {
    await client.get('/search').expect(400);
  });
});
