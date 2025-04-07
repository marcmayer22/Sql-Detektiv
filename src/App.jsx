
import React, { useEffect, useState } from 'react';
import initSqlJs from 'sql.js/dist/sql-wasm.js';

export default function App() {
  const [db, setDb] = useState(null);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [fall, setFall] = useState('fall1');
  const [schritt, setSchritt] = useState(0);

  const faelle = {
    fall1: {
      name: "Der Tatort in Berlin",
      beschreibungen: [
        "1. Zeige alle Tatorte in Berlin.",
        "2. Zeige alle Beobachtungen um 22:00 Uhr.",
        "3. Zeige alle Personen mit Rolle 'Täter'."
      ]
    },
    fall2: {
      name: "Das verdächtige Telefonat",
      beschreibungen: [
        "1. Zeige alle Telefonate.",
        "2. Zeige alle Telefonate um 20:15 Uhr.",
        "3. Zeige die Person mit ID 1."
      ]
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
  if (!db) {
    setError("❗ Die Datenbank ist noch nicht geladen.");
    return;
  }
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
  const aktFall = faelle[fall];

  if (!db) {
  return <p style={{ padding: '2rem', fontFamily: 'Arial' }}>📦 Datenbank wird geladen...</p>;
}

return (
    <div style={{ padding: '2rem', fontFamily: 'Arial', backgroundColor: '#f4f4f8' }}>
      <h1 style={{ color: '#1a237e' }}>🕵️ SQL Detektive</h1>

      <div style={{ marginBottom: '1rem' }}>
        {Object.keys(faelle).map(key => (
          <button key={key} onClick={() => { setFall(key); setSchritt(0); }} style={{ marginRight: '1rem' }}>
            {faelle[key].name}
          </button>
        ))}
      </div>

      <h2>{aktFall.name} – Schritt {schritt + 1}</h2>
      <p>{aktFall.beschreibungen[schritt]}</p>

      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Gib deine SQL-Abfrage ein...'
        style={{ width: '100%', minHeight: '100px' }}
      />

      <div style={{ marginTop: '1rem' }}>
        <button onClick={runQuery} style={{ marginRight: '1rem' }}>Abfrage ausführen</button>
        <button
          onClick={() => setSchritt((schritt + 1) % aktFall.beschreibungen.length)}
        >
          Nächster Schritt
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && result.length > 0 && (
        <table border='1' cellPadding='5' style={{ marginTop: '1rem', backgroundColor: '#fff' }}>
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
                <tr>{rows[0].columns.map(col => <th key={col}>{col}</th>)}</tr>
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
