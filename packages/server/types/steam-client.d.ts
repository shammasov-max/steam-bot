declare module 'steam-client' {
  import { EventEmitter } from 'events';

  export interface SteamClientOptions {
    httpProxy?: string;
  }

  export class SteamClient extends EventEmitter {
    constructor(options?: SteamClientOptions);

    // Common Steam client methods
    logOn(details: any): void;
    logOff(): void;
    relog(): void;
    setPersona(state: number): void;

    // Event emitter methods
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
  }

  export default SteamClient;
}
