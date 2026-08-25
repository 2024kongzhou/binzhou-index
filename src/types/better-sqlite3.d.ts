declare module "better-sqlite3" {
  class Database {
    constructor(filename: string);
    prepare(sql: string): {
      run(...params: any[]): { lastInsertRowid: number; changes: number };
      get(...params: any[]): any;
      all(...params: any[]): any[];
    };
    exec(sql: string): void;
    close(): void;
  }
  export default Database;
}
