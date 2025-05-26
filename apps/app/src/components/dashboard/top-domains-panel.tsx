interface TopDomainsPanelProps {
    domains: Array<[string, number]>;
}

export function TopDomainsPanel({ domains }: TopDomainsPanelProps) {
    return (
        <div className="space-y-3">
            <h3 className="text-xs text-muted-foreground uppercase tracking-wider">
                Top Domains
            </h3>
            <div className="space-y-2">
                {domains.length > 0 ? (
                    domains.map(([domain, count]) => (
                        <div key={domain} className="flex items-center justify-between py-1">
                            <span className="text-sm text-foreground">{domain}</span>
                            <span className="text-xs text-muted-foreground">{count}</span>
                        </div>
                    ))
                ) : (
                        <p className="text-xs text-muted-foreground py-2">No domains yet</p>
                )}
            </div>
        </div>
    );
} 