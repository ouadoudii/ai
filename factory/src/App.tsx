import { FormEvent, useState } from 'react';
import type { FactoryJob } from './lib/types';
import { validateIdea } from './lib/validation';

export function App() {
  const [idea, setIdea] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [job, setJob] = useState<FactoryJob | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const validation = validateIdea({ idea });
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    setBusy(true);
    setError('');
    setJob(null);
    try {
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ idea: validation.idea }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Factory-Job konnte nicht gestartet werden.');
      setJob(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unbekannter Fehler.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell">
      <section className="hero" aria-labelledby="factory-title">
        <p className="eyebrow">APP FACTORY</p>
        <h1 id="factory-title">Eine Idee rein. Eine getestete App raus.</h1>
        <p className="lede">
          ChatGPT plant die App, erstellt den Code, legt das GitHub-Repo an, führt die Quality-Gates aus,
          deployed auf Vercel und übergibt sie an die Improvement-Loop.
        </p>
      </section>

      <form className="card" onSubmit={submit}>
        <label htmlFor="idea">Geschäftsidee</label>
        <textarea
          id="idea"
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          placeholder="Zum Beispiel: Eine App, die ..."
          rows={8}
          disabled={busy}
        />
        <div className="rules" aria-label="Factory-Regeln">
          <span>✓ Branch + PR</span>
          <span>✓ Tests vor Deploy</span>
          <span>✓ Secrets nie im Repo</span>
          <span>✓ Production erst bei Grün</span>
        </div>
        <button disabled={busy} type="submit">{busy ? 'Factory arbeitet …' : 'App erstellen'}</button>
        {error && <p className="error" role="alert">{error}</p>}
      </form>

      {job && (
        <section className="card result" aria-live="polite">
          <p className="eyebrow">{job.stage.toUpperCase()}</p>
          <h2>{job.appName}</h2>
          <p>{job.message}</p>
          <div className="links">
            {job.githubUrl && <a href={job.githubUrl}>GitHub</a>}
            {job.vercelUrl && <a href={job.vercelUrl}>Live App</a>}
          </div>
        </section>
      )}
    </main>
  );
}
