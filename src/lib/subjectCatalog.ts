import type { StudySettings } from './studyData';

const KZ_PRIMARY = ['Казахский язык', 'Русский язык', 'Литературное чтение', 'Английский язык', 'Математика', 'Естествознание', 'Познание мира', 'Цифровая грамотность', 'Музыка', 'Художественный труд', 'Физическая культура'];
const KZ_MIDDLE = ['Казахский язык', 'Казахская литература', 'Русский язык', 'Русская литература', 'Английский язык', 'Математика', 'Информатика', 'Естествознание', 'История Казахстана', 'Всемирная история', 'География', 'Музыка', 'Художественный труд', 'Физическая культура', 'Глобальные компетенции'];
const KZ_SECONDARY = ['Казахский язык', 'Казахская литература', 'Русский язык', 'Русская литература', 'Английский язык', 'Алгебра', 'Геометрия', 'Информатика', 'Физика', 'Химия', 'Биология', 'География', 'История Казахстана', 'Всемирная история', 'Основы права', 'Художественный труд', 'Физическая культура', 'Глобальные компетенции'];
const KZ_HIGH = ['Казахский язык', 'Казахская литература', 'Русский язык', 'Русская литература', 'Английский язык', 'Алгебра и начала анализа', 'Геометрия', 'Информатика', 'Физика', 'Химия', 'Биология', 'География', 'История Казахстана', 'Всемирная история', 'Основы права', 'Начальная военная и технологическая подготовка', 'Основы предпринимательства и бизнеса', 'Графика и проектирование', 'Глобальные компетенции', 'Абайтану', 'Физическая культура'];

const US_PRIMARY = ['English Language Arts', 'Mathematics', 'Science', 'Social Studies', 'Computer Science', 'Health', 'Physical Education', 'Visual Arts', 'Music', 'World Language'];
const US_MIDDLE = ['English Language Arts', 'Mathematics', 'Pre-Algebra', 'Algebra I', 'Life Science', 'Earth Science', 'Physical Science', 'U.S. History', 'World History', 'Civics', 'Geography', 'Computer Science', 'Health', 'Physical Education', 'Visual Arts', 'Music', 'World Language'];
const US_HIGH = ['English Language Arts', 'Algebra I', 'Geometry', 'Algebra II', 'Precalculus', 'Statistics', 'Biology', 'Chemistry', 'Physics', 'Earth and Environmental Science', 'U.S. History', 'World History', 'Government and Civics', 'Economics', 'Geography', 'Computer Science', 'Health', 'Physical Education', 'Visual Arts', 'Music', 'Drama', 'World Language', 'Psychology'];

export function getSubjects(country: StudySettings['country'], grade: number) {
  if (country === 'США') return grade <= 5 ? US_PRIMARY : grade <= 8 ? US_MIDDLE : US_HIGH;
  if (grade <= 4) return KZ_PRIMARY;
  if (grade <= 6) return KZ_MIDDLE;
  if (grade <= 9) return KZ_SECONDARY;
  return KZ_HIGH;
}
