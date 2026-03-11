const express = require('express');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Inventory data (in-memory JSON)
const inventory = [
  { id: 1, type: 'Serveur', model: 'Dell PowerEdge R740', quantity: 5, status: 'Actif' },
  { id: 2, type: 'Switch', model: 'Cisco Catalyst 9300', quantity: 12, status: 'Actif' },
  { id: 3, type: 'Laptop', model: 'HP EliteBook 840', quantity: 45, status: 'Actif' },
  { id: 4, type: 'Serveur', model: 'HPE ProLiant DL380', quantity: 8, status: 'Actif' },
  { id: 5, type: 'Switch', model: 'Juniper EX4300', quantity: 6, status: 'Maintenance' }
];

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Get container info
const getContainerInfo = () => ({
  hostname: os.hostname(),
  ip: Object.values(os.networkInterfaces())
    .flat()
    .find(i => i.family === 'IPv4' && !i.internal)?.address || 'N/A'
});

// Home page with inventory
app.get('/', (req, res) => {
  const { hostname, ip } = getContainerInfo();
  res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TechLogix Inventory</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 2rem 1rem; }
    .main-container { max-width: 1400px; margin: 0 auto; }
    .header { background: rgba(255,255,255,0.98); backdrop-filter: blur(10px); border-radius: 20px; padding: 2.5rem; margin-bottom: 2rem; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
    .logo { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    .logo-icon { width: 50px; height: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
    h1 { font-size: 2.5rem; font-weight: 700; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .subtitle { color: #64748b; font-size: 1.1rem; margin-top: 0.5rem; font-weight: 500; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card { background: rgba(255,255,255,0.98); backdrop-filter: blur(10px); border-radius: 16px; padding: 1.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.1); transition: transform 0.3s, box-shadow 0.3s; }
    .stat-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
    .stat-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
    .stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
    .stat-icon.purple { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .stat-icon.blue { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
    .stat-label { font-size: 0.875rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #1e293b; font-family: 'Inter', monospace; }
    .table-section { background: rgba(255,255,255,0.98); backdrop-filter: blur(10px); border-radius: 20px; padding: 2rem; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
    .section-title { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
    .section-title::before { content: ''; width: 4px; height: 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 2px; }
    table { width: 100%; border-collapse: separate; border-spacing: 0; }
    thead { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    th { padding: 1.25rem 1.5rem; text-align: left; font-weight: 600; color: white; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.5px; }
    th:first-child { border-radius: 12px 0 0 0; }
    th:last-child { border-radius: 0 12px 0 0; }
    tbody tr { transition: all 0.2s; }
    tbody tr:hover { background: linear-gradient(90deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%); }
    td { padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 0.95rem; }
    tbody tr:last-child td { border-bottom: none; }
    .badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.875rem; font-weight: 600; }
    .badge::before { content: ''; width: 8px; height: 8px; border-radius: 50%; }
    .badge-active { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); color: #065f46; }
    .badge-active::before { background: #10b981; box-shadow: 0 0 8px #10b981; }
    .badge-maintenance { background: linear-gradient(135deg, #fed7aa 0%, #fbbf24 100%); color: #92400e; }
    .badge-maintenance::before { background: #f59e0b; box-shadow: 0 0 8px #f59e0b; }
    .type-badge { display: inline-block; padding: 0.375rem 0.875rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600; }
    .type-serveur { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #1e40af; }
    .type-switch { background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); color: #9f1239; }
    .type-laptop { background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); color: #3730a3; }
    @media (max-width: 768px) {
      body { padding: 1rem 0.5rem; }
      h1 { font-size: 1.75rem; }
      .stats-grid { grid-template-columns: 1fr; }
      table { font-size: 0.875rem; }
      th, td { padding: 1rem; }
    }
  </style>
</head>
<body>
  <div class="main-container">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">🏢</div>
        <div>
          <h1>TechLogix Inventory</h1>
          <p class="subtitle">Plateforme de Gestion d'Inventaire Informatique</p>
        </div>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-icon purple">🖥️</div>
          <div class="stat-label">Container ID</div>
        </div>
        <div class="stat-value">${hostname}</div>
      </div>
      <div class="stat-card">
        <div class="stat-header">
          <div class="stat-icon blue">🌐</div>
          <div class="stat-label">IP Address</div>
        </div>
        <div class="stat-value">${ip}</div>
      </div>
    </div>
    <div class="table-section">
      <h2 class="section-title">Inventaire Matériel</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Modèle</th>
            <th>Quantité</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          ${inventory.map(item => `
            <tr>
              <td><strong>#${item.id}</strong></td>
              <td><span class="type-badge type-${item.type.toLowerCase()}">${item.type}</span></td>
              <td>${item.model}</td>
              <td><strong>${item.quantity}</strong> unités</td>
              <td><span class="badge badge-${item.status.toLowerCase() === 'actif' ? 'active' : 'maintenance'}">${item.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>
  `);
});

// Health check (Liveness Probe)
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Readiness check (Readiness Probe)
app.get('/ready', (req, res) => {
  const isReady = inventory.length > 0;
  res.status(isReady ? 200 : 503).json({ 
    ready: isReady, 
    timestamp: new Date().toISOString() 
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✅ TechLogix Inventory running on port ${PORT}`);
  console.log(`🖥️  Hostname: ${os.hostname()}`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received. Closing server gracefully...`);
  server.close(() => {
    console.log('✅ Server closed. Exiting process.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
