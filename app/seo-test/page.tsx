export default function SEOTestPage() {
  return (
    <div style={{ padding: '40px', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1>SEO Dashboard Test Page</h1>
      <p>If you see this, the deployment works!</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  );
}
