type Props = { title: string; description: string; status?: string; items?: string[] };
export function CapabilityCard({ title, description, status, items }: Props) {
  return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p>{status && <p role="status">{status}</p>}{items && <ul>{items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>}</div></section>;
}
