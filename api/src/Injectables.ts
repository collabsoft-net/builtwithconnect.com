
const Injectables = {
  AP: Symbol.for('AP'),
  Mode: Symbol.for('Mode'),
  Repository: Symbol.for('Repository'),
  EventEmitter: Symbol.for('EventEmitter'),
  EntryPoint: Symbol.for('EntryPoint'),

  RestClientService: Symbol.for('RestClientService'),
  SearchClientService: Symbol.for('SearchClientService'),
  SearchIndexerService: Symbol.for('SearchIndexerService')
};

export default Injectables;
export { Injectables };
