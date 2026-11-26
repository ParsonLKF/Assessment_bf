import * as nodeModule from 'node:module';
import * as hooks from './typescript-hooks.mjs';

// Node 22.12 supports asynchronous hooks. Newer releases can use sync hooks.
if (nodeModule.registerHooks) nodeModule.registerHooks(hooks);
else nodeModule.register('./typescript-hooks.mjs', import.meta.url);
