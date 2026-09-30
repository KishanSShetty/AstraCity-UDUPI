export const AuditLogger = {
  logEvent: (event: any) => {
    if (typeof window !== 'undefined') {
      try {
        const logs = JSON.parse(sessionStorage.getItem('udupi_swm_audit_logs') || '[]');
        logs.push({ ...event, timestamp: new Date().toISOString() });
        sessionStorage.setItem('udupi_swm_audit_logs', JSON.stringify(logs.slice(-100)));
      } catch {
        // ignore storage errors
      }
    }
  }
};
