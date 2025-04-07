import React, { useEffect, useState } from 'react';
import initSqlJs from 'sql.js/dist/sql-wasm.js';

export default function App() {
  const [db, setDb] = useState(null);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

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

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>🕵️ SQL Detektive (Vite)</h1>
      <p><strong>Fall 1:</strong> Wer war am Tatort Mozartstraße 12 um 22:00 Uhr und hat kein Alibi?</p>
      <p><strong>Fall 2:</strong> Wer hat um 20:15 Uhr telefoniert?</p>
      <p><strong>Fall 3:</strong> Wer besitzt das Fahrzeug mit Kennzeichen B-XY 1234 und hat kein Alibi?</p>

      <textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Gib deine SQL-Abfrage hier ein...'></textarea>
      <button onClick={runQuery} style={{ marginTop: '1rem' }}>Abfrage ausführen</button>

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
    </div>
  );
}
