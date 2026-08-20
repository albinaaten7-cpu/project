export type LearningResource = {
  title: string;
  description: string;
  url: string;
  kind: 'Теория' | 'Практика' | 'Справочник';
};

const includesAny = (value: string, words: string[]) => words.some((word) => value.includes(word));
const khanSearch = (topic: string) => `https://ru.khanacademy.org/search?page_search_query=${encodeURIComponent(topic)}`;

export function getLearningResources(subject: string, topic: string): LearningResource[] {
  const normalized = subject.toLocaleLowerCase('ru-RU');

  if (includesAny(normalized, ['математ', 'алгебр', 'геометр'])) return [
    { title: 'Академия Хана', description: `Уроки и задания по теме «${topic}» на русском языке.`, url: khanSearch(topic), kind: 'Практика' },
    { title: 'GeoGebra', description: 'Интерактивные модели, графики и геометрические построения.', url: `https://www.geogebra.org/search/${encodeURIComponent(topic)}`, kind: 'Практика' },
  ];

  if (includesAny(normalized, ['физик', 'хими', 'биолог', 'естеств', 'географ'])) return [
    { title: 'Академия Хана', description: `Объяснения и упражнения по теме «${topic}».`, url: khanSearch(topic), kind: 'Теория' },
    { title: 'OpenStax', description: 'Бесплатные рецензируемые учебники по естественным наукам.', url: 'https://openstax.org/subjects/science', kind: 'Справочник' },
    { title: 'NASA Science', description: 'Научные материалы, модели и задания для школьников.', url: 'https://science.nasa.gov/learn/resources/', kind: 'Практика' },
  ];

  if (includesAny(normalized, ['русск', 'литератур'])) return [
    { title: 'Грамота.ру', description: 'Правила, словари и учебник русского языка от экспертов.', url: 'https://gramota.ru/', kind: 'Справочник' },
    { title: 'Культура.РФ', description: 'Произведения, биографии авторов и разбор культурного контекста.', url: 'https://www.culture.ru/literature', kind: 'Теория' },
  ];

  if (includesAny(normalized, ['информат', 'цифров'])) return [
    { title: 'MDN Learn', description: 'Проверенные основы веб-технологий и практические задания.', url: 'https://developer.mozilla.org/ru/docs/Learn_web_development', kind: 'Практика' },
    { title: 'Академия Хана', description: `Видео и упражнения по теме «${topic}».`, url: khanSearch(topic), kind: 'Теория' },
  ];

  return [
    { title: 'Академия Хана', description: `Найти бесплатные уроки по теме «${topic}».`, url: khanSearch(topic), kind: 'Теория' },
    { title: 'Открытые учебники OpenStax', description: 'Бесплатные учебники с редакционной проверкой.', url: 'https://openstax.org/subjects', kind: 'Справочник' },
  ];
}
