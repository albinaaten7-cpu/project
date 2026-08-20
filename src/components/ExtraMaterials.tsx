import { getLearningResources } from '../lib/learningResources';

export function ExtraMaterials({ subject, topic }: { subject: string; topic: string }) {
  const resources = getLearningResources(subject, topic);

  return (
    <aside className="extra-materials" aria-labelledby={`materials-${subject}-${topic}`}>
      <div className="extra-materials-heading">
        <div><span>✓ Проверенные площадки</span><h3 id={`materials-${subject}-${topic}`}>Дополнительные материалы</h3></div>
        <small>Открываются в новой вкладке</small>
      </div>
      <div className="resource-list">
        {resources.map((resource) => (
          <a href={resource.url} target="_blank" rel="noreferrer" key={resource.title}>
            <span>{resource.kind}</span><b>{resource.title}</b><p>{resource.description}</p><i aria-hidden="true">↗</i>
          </a>
        ))}
      </div>
      <p className="resource-note">Мы проверили сами площадки. Сверяй материал с темой своего урока.</p>
    </aside>
  );
}
