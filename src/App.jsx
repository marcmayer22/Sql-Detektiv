import React, { useEffect, useState } from 'react';
import initSqlJs from 'sql.js/dist/sql-wasm.js';

export default function App() {
  const [db, setDb] = useState(null);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [fall, setFall] = useState('fall1');

  const faelle = {
    fall1: {
      beschreibung: 'Wer war am Tatort Mozartstraße 12 um 22:00 Uhr und hat kein Alibi?',
      beispiel: `SELECT p.name FROM personen p
JOIN beobachtungen b ON p.id = b.person_id
JOIN tatorte t ON b.tatort_id = t.id
LEFT JOIN alibis a ON p.id = a.person_id
WHERE t.ort = 'Mozartstraße 12'
AND t.zeit = '22:00'
AND (a.status IS NULL OR a.status != 'bestätigt');`
    },
    fall2: {
      beschreibung: 'Wer hat um 20:15 Uhr telefoniert?',
      beispiel: `SELECT p.name FROM telefonate t
JOIN personen p ON t.von_id = p.id
WHERE t.uhrzeit = '20:15';`
    },
    fall3: {
      beschreibung: 'Wer besitzt das Fahrzeug mit Kennzeichen B-XY 1234 und hat kein Alibi?',
      beispiel: `SELECT p.name FROM fahrzeuge f
JOIN personen p ON f.besitzer_id = p.id
LEFT JOIN alibis a ON p.id = a.person_id
WHERE f.kennzeichen = 'B-XY 1234'
AND (a.status IS NULL OR a.status != 'bestätigt');`
    }
  };

  useEffect(() => {
    const loadDb = async () => {
      const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/sql-wasm.wasm`
      });
      const db = new SQL.Database();

      db.run(`CREATE TABLE personen (id INTEGER, name TEXT, rolle TEXT);
              CREATE TABLE tatorte (id INTEGER, ort TEXT, stadt TEXT, zeit TEXT);
              CREATE TABLE beobachtungen (id INTEGER, person_id INTEGER, tatort_id INTEGER, uhrzeit TEXT);
              CREATE TABLE alibis (id INTEGER, person_id INTEGER, status TEXT);
              CREATE TABLE telefonate (id INTEGER, von_id INTEGER, an_id INTEGER, uhrzeit TEXT);
              CREATE TABLE fahrzeuge (id INTEGER, kennzeichen TEXT, besitzer_id INTEGER);

              INSERT INTO personen VALUES (1, 'Max Müller', 'Zeuge'), (2, 'Lena Schulz', 'Täter'), (3, 'Tom Becker', 'Zeuge');
              INSERT INTO tatorte VALUES (1, 'Mozartstraße 12', 'Berlin', '22:00');
              INSERT INTO beobachtungen VALUES (1, 1, 1, '22:00'), (2, 2, 1, '22:00');
              INSERT INTO alibis VALUES (1, 1, 'bestätigt');
              INSERT INTO telefonate VALUES (1, 1, NULL, '20:15');
              INSERT INTO fahrzeuge VALUES (1, 'B-XY 1234', 2);`);

      setDb(db);
    };
    loadDb();
  }, []);

  const runQuery = () => {
    try {
      setError('');
      const res = db.exec(query);
      setResult(res);
    } catch (e) {
      setResult(null);
      setError(e.message);
    }
  };

  const showTable = (tableName) => {
    if (!db) return [];
    try {
      return db.exec(`SELECT * FROM ${tableName}`);
    } catch {
      return [];
    }
  };

  const tabellen = ['personen', 'tatorte', 'beobachtungen', 'alibis', 'telefonate', 'fahrzeuge'];

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>🕵️ SQL Detektive (Fälle wechseln & Tabellen einsehen)</h1>

      <div style={{ marginBottom: '1rem' }}>
        {Object.keys(faelle).map(key => (
          <button key={key} onClick={() => setFall(key)} style={{ marginRight: '1rem' }}>
            {key.toUpperCase()}
          </button>
        ))}
      </div>

      <p><strong>Fallbeschreibung:</strong> {faelle[fall].beschreibung}</p>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Gib deine SQL-Abfrage hier ein...'
      />
      <div style={{ marginTop: '0.5rem' }}>
        <button onClick={runQuery}>Abfrage ausführen</button>
        <button onClick={() => setQuery(faelle[fall].beispiel)} style={{ marginLeft: '1rem' }}>
          Beispiel anzeigen
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && result.length > 0 && (
        <table border='1' cellPadding='5' style={{ marginTop: '1rem', background: '#fff' }}>
          <thead>
            <tr>
              {result[0].columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result[0].values.map((row, idx) => (
              <tr key={idx}>
                {row.map((val, i) => (
                  <td key={i}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 style={{ marginTop: '2rem' }}>📊 Tabellenübersicht</h2>
      {tabellen.map(t => {
        const rows = showTable(t);
        return rows.length > 0 ? (
          <div key={t} style={{ marginBottom: '2rem' }}>
            <h3>{t}</h3>
            <table border='1' cellPadding='5'>
              <thead>
                <tr>
                  {rows[0].columns.map(col => <th key={col}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows[0].values.map((r, idx) => (
                  <tr key={idx}>
                    {r.map((val, i) => <td key={i}>{val}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null;
      })}
    </div>
  );
}
