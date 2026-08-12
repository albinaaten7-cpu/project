import { Link } from 'wouter';

export function HistoryLink() {
  return <Link href="/history" className="history-link" title="История обучения" aria-label="История обучения"><span>↺</span><b>История</b></Link>;
}
