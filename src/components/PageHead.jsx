import { Link } from '../lib/router.jsx';
import Smoke from './Smoke.jsx';

// Dark page header used by every inner page: breadcrumb, numbered kicker, oversized title.
export default function PageHead({ index, label, title, accent, children }) {
  return (
    <section className="pagehead" aria-labelledby="page-title">
      <Smoke density={2} />
      <div className="container pagehead__inner">
        <nav className="pagehead__crumbs mono" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{label}</span>
        </nav>
        <p className="pagehead__index mono">({index}) {label}</p>
        <h1 id="page-title" className="pagehead__title">
          <span className="hline"><span>{title}</span></span>
          {accent && <span className="hline hline--accent"><span>{accent}</span></span>}
        </h1>
        {children && <p className="pagehead__lead">{children}</p>}
      </div>
    </section>
  );
}
