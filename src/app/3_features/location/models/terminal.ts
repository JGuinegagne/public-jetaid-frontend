import { AirportResponse } from './airport';

export class Terminal {
  code: string;
  name: string;
  airportCode: string;

  public shortTitle(): string{
    return this.code;
  }

  public fullTitle(): string{
    return `Terminal: ${this.name}`;
  }

  public static displayList(list: Terminal[]): string {
    if(!list || !list.length) return null;
    if(list.length === 1) 
      return `${list[0].airportCode} ${list[0].shortTitle()}`;

    
    return [
      `${list[0].airportCode} ${list[0].shortTitle()}`,
      ...list
        .slice(1)
        .map(terminal => terminal.shortTitle())
    ].join(' | ');
  }


}

export interface TerminalResponse extends AirportResponse {
  terminalCode: string;
  terminalName: string;
}
