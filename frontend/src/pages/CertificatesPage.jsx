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

  if (loading) return <p>Loading certificates...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="stack">
      <h2>Certificates</h2>
      {certificates.map((certificate) => (
        <article key={certificate.id} className="card">
          <h3>{certificate.course_title || certificate.course_id}</h3>
          <p>{certificate.certificate_number}</p>
          <p>Generated: {new Date(certificate.generated_at).toLocaleString()}</p>
        </article>
      ))}
    </div>
  );
}

