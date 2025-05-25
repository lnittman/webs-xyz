interface TopDomainsPanelProps {
    domains: Array<[string, number]>;
}

export function TopDomainsPanel({ domains }: TopDomainsPanelProps) {
    return (
        <div className="border border-border bg-card p-4">
            <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                TOP DOMAINS
            </h3>
            <div className="space-y-2">
                {domains.length > 0 ? (
                    domains.map(([domain, count]) => (
                        <div key={domain} className="flex items-center justify-between">
                            <span className="text-xs font-mono text-foreground">{domain}</span>
                            <span className="text-xs text-muted-foreground">{count}</span>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-muted-foreground">No domains yet</p>
                )}
            </div>
        </div>
    );
} 