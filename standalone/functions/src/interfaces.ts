/* eslint-disable @typescript-eslint/no-empty-interface */

declare global {

  interface ConnectSession extends Session {
  }

  /* eslint-disable-next-line @typescript-eslint/no-namespace */
  namespace Express {
    interface User extends ConnectSession { }
  }
}

export { }

