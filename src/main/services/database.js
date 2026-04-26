const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const crypto = require('crypto');

class DatabaseService {
  constructor() {
    this.db = null;
    this.dbPath = path.join(app.getPath('userData'), 'eloqua.db');
  }

  init() {
    try {
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');
      this.createTables();
      console.log('Local SQLite database initialized at', this.dbPath);
      return true;
    } catch (error) {
      console.error('Failed to initialize local database:', error);
      return false;
    }
  }

  createTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS tournaments (
        id TEXT PRIMARY KEY,
        name TEXT,
        start_date TEXT,
        format TEXT,
        tabbycat_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS debate_results (
        id TEXT PRIMARY KEY,
        round_id TEXT,
        tournament_id TEXT,
        team_number TEXT,
        speaker1_name TEXT,
        speaker2_name TEXT,
        position TEXT,
        result TEXT,
        team_score INTEGER,
        speaker1_score INTEGER,
        speaker2_score INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(tournament_id) REFERENCES tournaments(id)
      )`,
      `CREATE TABLE IF NOT EXISTS debate_rounds (
        id TEXT PRIMARY KEY,
        tournament_id TEXT,
        round TEXT,
        motion TEXT,
        date TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(tournament_id) REFERENCES tournaments(id)
      )`,
      `CREATE TABLE IF NOT EXISTS partners (
        id TEXT PRIMARY KEY,
        name TEXT,
        school TEXT,
        email TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS team_statistics (
        id TEXT PRIMARY KEY,
        tournament_id TEXT,
        team_name TEXT,
        partner_name TEXT,
        total_points INTEGER,
        total_speaker_score INTEGER,
        first_places INTEGER,
        second_places INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(tournament_id) REFERENCES tournaments(id)
      )`,
      `CREATE TABLE IF NOT EXISTS speeches (
        id TEXT PRIMARY KEY,
        tournament_id TEXT,
        round_id TEXT,
        debater_name TEXT,
        position TEXT,
        motion TEXT,
        debate_format TEXT,
        audio_file_path TEXT,
        audio_path TEXT,
        duration REAL,
        transcript TEXT,
        nlp_stats TEXT,
        llm_feedback TEXT,
        conversation_history TEXT,
        chat_context TEXT,
        score INTEGER,
        round_number TEXT,
        round_type TEXT,
        partner TEXT,
        analysis_result TEXT,
        llm_analysis TEXT,
        speech_date TEXT,
        place_in_round TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    const transaction = this.db.transaction(() => {
      for (const table of tables) {
        this.db.prepare(table).run();
      }
    });

    transaction();
  }

  // Simplified Supabase-like query executor
  async query(table, operations) {
    if (!this.db) throw new Error('Database not initialized');

    try {
      let sql = '';
      let values = [];
      let isSelect = false;
      let isInsert = false;
      let isUpdate = false;
      let isDelete = false;

      // Extract base operation
      const selectOp = operations.find(o => o.type === 'select');
      const insertOp = operations.find(o => o.type === 'insert');
      const updateOp = operations.find(o => o.type === 'update');
      const deleteOp = operations.find(o => o.type === 'delete');

      if (insertOp) {
        isInsert = true;
        let data = Array.isArray(insertOp.args[0]) ? insertOp.args[0] : [insertOp.args[0]];
        
        data = data.map(item => {
          if (!item.id) {
            return { id: crypto.randomUUID(), ...item };
          }
          return item;
        });

        const keys = Object.keys(data[0]);
        const placeholders = keys.map(() => '?').join(', ');
        sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
        
        const stmt = this.db.prepare(sql);
        const transaction = this.db.transaction((items) => {
          for (const item of items) {
            stmt.run(keys.map(k => {
               if (typeof item[k] === 'object' && item[k] !== null) return JSON.stringify(item[k]);
               return item[k];
            }));
          }
        });
        transaction(data);
        
        let results = data;
        if (operations.some(o => o.type === 'single')) {
          results = results[0] || null;
        }
        
        return { data: results, error: null };
      } else if (updateOp) {
        isUpdate = true;
        const data = updateOp.args[0];
        const keys = Object.keys(data);
        const setString = keys.map(k => `${k} = ?`).join(', ');
        sql = `UPDATE ${table} SET ${setString}`;
        values = keys.map(k => {
          if (typeof data[k] === 'object' && data[k] !== null) return JSON.stringify(data[k]);
          return data[k];
        });
      } else if (deleteOp) {
        isDelete = true;
        sql = `DELETE FROM ${table}`;
      } else if (selectOp) {
        isSelect = true;
        // Basic relation handling, e.g. "*,tournaments(name)"
        let columns = selectOp.args[0] || '*';
        if (columns.includes('tournaments(name)')) {
          columns = 'speeches.*, tournaments.name as tournament_name';
          sql = `SELECT ${columns} FROM ${table} LEFT JOIN tournaments ON ${table}.tournament_id = tournaments.id`;
        } else if (columns.includes('debate_results(id,result,speaker1_score,team_score,debate_rounds!inner(id,round))')) {
            columns = 'tournaments.*';
            sql = `SELECT * FROM ${table}`;
        } else {
            sql = `SELECT * FROM ${table}`;
        }
      }

      // Add WHERE clauses
      let whereAdded = false;
      for (const op of operations) {
        if (op.type === 'eq') {
          sql += whereAdded ? ' AND ' : ' WHERE ';
          sql += `${table}.${op.args[0]} = ?`;
          values.push(op.args[1]);
          whereAdded = true;
        } else if (op.type === 'in') {
          sql += whereAdded ? ' AND ' : ' WHERE ';
          const inPlaceholders = op.args[1].map(() => '?').join(', ');
          sql += `${table}.${op.args[0]} IN (${inPlaceholders})`;
          values.push(...op.args[1]);
          whereAdded = true;
        } else if (op.type === 'ilike') {
          sql += whereAdded ? ' AND ' : ' WHERE ';
          // SQLite LIKE is case-insensitive by default
          sql += `${table}.${op.args[0]} LIKE ?`;
          values.push(op.args[1]);
          whereAdded = true;
        } else if (op.type === 'or') {
            // Very simple OR handler for common queries
            const conditions = op.args[0].split(',').map(c => {
                const [col, val] = c.split('.eq.');
                const cleanedVal = val.replace(/^"|"$/g, ''); // strip quotes
                values.push(cleanedVal);
                return `${table}.${col.trim()} = ?`;
            });
            sql += whereAdded ? ' AND ' : ' WHERE ';
            sql += `(${conditions.join(' OR ')})`;
            whereAdded = true;
        }
      }

      if (isUpdate || isDelete) {
        const stmt = this.db.prepare(sql);
        stmt.run(values);
        return { data: null, error: null };
      }

      // Add ORDER BY, LIMIT
      for (const op of operations) {
        if (op.type === 'order') {
          const col = op.args[0];
          const ascending = op.args[1]?.ascending !== false;
          sql += ` ORDER BY ${col} ${ascending ? 'ASC' : 'DESC'}`;
        } else if (op.type === 'limit') {
          sql += ` LIMIT ?`;
          values.push(op.args[0]);
        }
      }

      if (isSelect) {
        const stmt = this.db.prepare(sql);
        let results = stmt.all(values);
        
        // Handle .single()
        if (operations.some(o => o.type === 'single')) {
          results = results[0] || null;
        }

        // Parse JSON strings back to objects
        const parseJsonFields = (row) => {
            if (!row) return row;
            for (const key of Object.keys(row)) {
                if (typeof row[key] === 'string' && (row[key].startsWith('{') || row[key].startsWith('['))) {
                    try {
                        row[key] = JSON.parse(row[key]);
                    } catch(e) {}
                }
            }
            // fix relational nesting for ui
            if (row.tournament_name) {
                row.tournaments = { name: row.tournament_name };
                delete row.tournament_name;
            }
            return row;
        };

        if (Array.isArray(results)) {
            results = results.map(parseJsonFields);
        } else {
            results = parseJsonFields(results);
        }

        return { data: results, error: null };
      }

      return { data: null, error: null };
    } catch (error) {
      console.error('Database query error:', error);
      return { data: null, error: error.message };
    }
  }
}

module.exports = new DatabaseService();
