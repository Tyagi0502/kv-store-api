import {inject} from '@loopback/context';
import {
  FindRoute,
  InvokeMethod,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler,
} from '@loopback/rest';
import {restResponseTimeHistogram} from './metrics';

const SequenceActions = RestBindings.SequenceActions;

export class MySequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
  ) {}

  async handle(context: RequestContext) {
    const {request, response} = context;
    const startTime = Date.now();
    let path = '';
    try {
      const route = this.findRoute(request);
      path = route.path;
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);
      this.send(response, result);

      const endTime = Date.now();
      restResponseTimeHistogram.observe(
        {
          method: request.method,
          route: path,
          statusCode: response.statusCode,
        },
        endTime - startTime,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      this.reject(context, error);

      const endTime = Date.now();
      restResponseTimeHistogram.observe(
        {
          method: request.method,
          route: path,
          statusCode: response.statusCode,
        },
        endTime - startTime,
      );
    }
  }
}
