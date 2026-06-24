import { useEffect, useState } from 'react';
import { api } from '../api';

const STUDENT_ID = 'student-1';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getCertificates(STUDENT_ID)
      .then(setCertificates)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card loading-panel">
        <p className="eyebrow">Certificates</p>
        <div className="pulse" />
        <div className="pulse" />
      </div>
    );
  }

  if (error) return <div className="card"><p className="error">{error}</p></div>;

  return (
    <div className="stack">
      <div className="section-title">
        <div>
          <p className="eyebrow">Completion</p>
          <h2>Certificates</h2>
        </div>
        <p className="muted">{certificates.length} issued</p>
      </div>

      {certificates.length === 0 ? (
        <div className="card empty-state">
          <h3>No certificates yet</h3>
          <p className="muted">Complete a course to generate the first certificate.</p>
        </div>
      ) : (
        <div className="grid">
          {certificates.map((certificate) => (
            <article key={certificate.id} className="card stack">
              <div className="meta">
                <span className="badge success">Generated</span>
                <span>{new Date(certificate.generated_at).toLocaleString()}</span>
              </div>
              <h3>{certificate.course_title || certificate.course_id}</h3>
              <p className="muted">{certificate.certificate_number}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

