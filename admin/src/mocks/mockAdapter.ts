// Installs the mock backend onto an axios instance. When active, ZERO
// requests leave the browser — every call is answered from ./handlers.ts.
import type { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { dispatch } from './handlers';

let installed = false;

export function installMockAdapter(client: AxiosInstance, delayMs = 350) {
  if (installed) return;
  installed = true;

  const mock = new MockAdapter(client, { delayResponse: delayMs });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mock.onAny().reply(async (config: any) => dispatch(config));

  // eslint-disable-next-line no-console
  console.info(
    '%c[GrowVio Admin] Mock API mode is ON — all requests are served locally, nothing reaches the backend.',
    'color:#4F46E5;font-weight:bold',
  );
}
