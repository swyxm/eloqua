import { getSupabaseClient } from './supabaseClient';

class LocalQueryBuilder {
  constructor(table) {
    this.table = table;
    this.operations = [];
  }

  select(columns = '*') {
    this.operations.push({ type: 'select', args: [columns] });
    return this;
  }

  insert(data) {
    this.operations.push({ type: 'insert', args: [data] });
    return this;
  }

  update(data) {
    this.operations.push({ type: 'update', args: [data] });
    return this;
  }

  delete() {
    this.operations.push({ type: 'delete', args: [] });
    return this;
  }

  eq(column, value) {
    this.operations.push({ type: 'eq', args: [column, value] });
    return this;
  }

  in(column, values) {
    this.operations.push({ type: 'in', args: [column, values] });
    return this;
  }
  
  ilike(column, pattern) {
    this.operations.push({ type: 'ilike', args: [column, pattern] });
    return this;
  }
  
  or(condition) {
    this.operations.push({ type: 'or', args: [condition] });
    return this;
  }

  order(column, options = { ascending: true }) {
    this.operations.push({ type: 'order', args: [column, options] });
    return this;
  }

  limit(count) {
    this.operations.push({ type: 'limit', args: [count] });
    return this;
  }

  single() {
    this.operations.push({ type: 'single', args: [] });
    return this;
  }

  async then(resolve, reject) {
    try {
      const result = await window.electronAPI.dbQuery(this.table, this.operations);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  }
}

class DataClient {
  constructor() {
    this.mode = 'local';
    this.supabase = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      let settings = null;
      if (window.electron?.ipcRenderer?.invoke) {
        settings = await window.electron.ipcRenderer.invoke('get-settings');
      } else if (window.electronAPI?.getSettings) {
        settings = await window.electronAPI.getSettings();
      }
      
      if (settings && settings.databaseMode) {
        this.mode = settings.databaseMode;
      }
    } catch (e) {
      console.error('Failed to get database mode:', e);
    }

    if (this.mode === 'supabase') {
      this.supabase = await getSupabaseClient();
    }
    
    this.initialized = true;
  }

  from(table) {
    if (this.mode === 'supabase') {
      if (!this.supabase) throw new Error('Supabase client not initialized');
      return this.supabase.from(table);
    } else {
      return new LocalQueryBuilder(table);
    }
  }
}

// Singleton instance
const client = new DataClient();

export async function getDataClient() {
  await client.init();
  return client;
}
