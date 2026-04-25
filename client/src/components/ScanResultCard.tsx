type ScanResultCardProps = {
  softwareName?: string;
  domain?: string;
  capabilityCount?: number;
};

function ScanResultCard({
  softwareName = "Unavailable",
  domain = "Unavailable",
  capabilityCount = 0
}: ScanResultCardProps) {
  return (
    <section className="scan-result-card" aria-label="Scan result">
      <div className="scan-result-header">
        <span className="scan-status-dot" aria-hidden="true" />
        <strong>Scan complete</strong>
      </div>

      <dl>
        <div>
          <dt>Connected software</dt>
          <dd>{softwareName}</dd>
        </div>
        <div>
          <dt>Domain</dt>
          <dd>{domain}</dd>
        </div>
        <div>
          <dt>Capabilities detected</dt>
          <dd>{capabilityCount}</dd>
        </div>
        <div>
          <dt>Mock capability model</dt>
          <dd>active</dd>
        </div>
        <div>
          <dt>Runtime</dt>
          <dd>simulated</dd>
        </div>
        <div>
          <dt>Generated UI</dt>
          <dd>enabled</dd>
        </div>
      </dl>
    </section>
  );
}

export default ScanResultCard;
