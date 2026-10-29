import { useEffect, useState } from 'react';
import { getTeam, approveRequest, declineRequest, removeAdmin } from './data.js';
import { Loading, ConfirmDialog } from './ui.jsx';

const when = (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

// Approve people who signed up on /admin, and manage who has admin access.
export default function Team({ notify, me }) {
  const [team, setTeam] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [confirm, setConfirm] = useState(null); // { kind: 'decline' | 'remove', person }

  const load = () => {
    setError('');
    getTeam().then(setTeam).catch((e) => setError(e.message));
  };
  useEffect(load, []);

  async function run(person, action, message) {
    setBusyId(person.user_id);
    try {
      await action(person.user_id);
      notify(message);
      setConfirm(null);
      load();
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <p className="adm-alert" role="alert">{error} <button className="linkbtn" onClick={load}>Try again</button></p>;
  if (!team) return <Loading text="Loading team…" />;

  return (
    <>
      <div className="adm-pagehead">
        <div>
          <h1 className="adm-title">Team</h1>
          <p className="adm-muted">Who can manage the store. New sign-ups wait here until you approve them.</p>
        </div>
      </div>

      <section className="adm-card" aria-labelledby="sec-requests">
        <h2 className="adm-card__title" id="sec-requests">
          Waiting for approval {team.requests.length > 0 && <span className="adm-badge adm-badge--warn">{team.requests.length}</span>}
        </h2>
        {team.requests.length === 0 ? (
          <p className="adm-muted">No requests right now. When someone signs up on the admin page, they’ll appear here.</p>
        ) : (
          <>
            <p className="adm-hint">Only approve people you know. Approved accounts can change products, prices and store settings.</p>
            <ul className="adm-people">
              {team.requests.map((r) => (
                <li key={r.user_id} className="adm-person" aria-busy={busyId === r.user_id || undefined}>
                  <div>
                    <p className="adm-person__email">{r.email}</p>
                    <p className="adm-hint">Signed up {when(r.created_at)}</p>
                  </div>
                  <div className="adm-row">
                    <button className="btn btn--ink" disabled={busyId === r.user_id} onClick={() => run(r, approveRequest, `${r.email} is now an admin`)} aria-label={`Approve ${r.email}`}>Approve</button>
                    <button className="btn btn--line adm-btn--danger-line" disabled={busyId === r.user_id} onClick={() => setConfirm({ kind: 'decline', person: r })} aria-label={`Decline ${r.email}`}>Decline</button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="adm-card" aria-labelledby="sec-admins">
        <h2 className="adm-card__title" id="sec-admins">Admins</h2>
        <ul className="adm-people">
          {team.admins.map((a) => (
            <li key={a.user_id} className="adm-person">
              <div>
                <p className="adm-person__email">{a.email} {a.user_id === me && <span className="adm-badge adm-badge--blue">You</span>}</p>
                <p className="adm-hint">Admin since {when(a.created_at)}</p>
              </div>
              {a.user_id !== me && (
                <button className="btn btn--line adm-btn--danger-line" disabled={busyId === a.user_id} onClick={() => setConfirm({ kind: 'remove', person: a })} aria-label={`Remove ${a.email}`}>Remove</button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.kind === 'remove' ? 'Remove admin?' : 'Decline request?'}
        confirmLabel={confirm?.kind === 'remove' ? 'Remove admin' : 'Decline and delete'}
        busy={Boolean(confirm && busyId === confirm.person.user_id)}
        onCancel={() => setConfirm(null)}
        onConfirm={() =>
          confirm.kind === 'remove'
            ? run(confirm.person, removeAdmin, `${confirm.person.email} no longer has access`)
            : run(confirm.person, declineRequest, `Declined ${confirm.person.email}`)
        }
      >
        {confirm && (
          <p>
            {confirm.kind === 'remove'
              ? <><strong>{confirm.person.email}</strong> will lose access straight away and their account will be deleted. They can sign up again, but would need approval.</>
              : <>The account <strong>{confirm.person.email}</strong> will be deleted. They won’t get access.</>}
          </p>
        )}
      </ConfirmDialog>
    </>
  );
}
