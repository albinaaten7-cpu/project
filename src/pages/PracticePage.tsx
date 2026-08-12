import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { DayNavigator } from '../components/DayNavigator';
import { LessonBrief } from '../components/LessonBrief';
import { QuizRound } from '../components/QuizRound';
import { generateDailyLesson, getTotalStudyDays, lessonQuestions, loadDailyLessons, type DailyLesson } from '../lib/dailyLessons';
import { loadStudyData, type StudySettings } from '../lib/studyData';
import type { PracticeQuestion } from '../lib/practice';
import type { Subject } from '../lib/studyPlanner';
import { supabase } from '../lib/supabase';
import { awardQuizXp } from '../lib/profile';
import { HistoryLink } from '../components/HistoryLink';

export function PracticePage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [settings, setSettings] = useState<StudySettings | null>(null);
  const [lessons, setLessons] = useState(new Map<number, DailyLesson>());
  const [selectedDay, setSelectedDay] = useState(0);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [index, setIndex] = useState(-1);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [awardedDays, setAwardedDays] = useState(new Set<number>());
  const autoOpened = useRef(false);
  const requestedDay = useRef(Math.max(1, Number(new URLSearchParams(window.location.search).get('day')) || 1));
  const totalDays = settings && subjects.length ? getTotalStudyDays(subjects, settings.studyDaysPerWeek) : 0;
  const lesson = lessons.get(selectedDay);

  useEffect(() => {
    async function load() {
      let { data } = await supabase.auth.getSession();
      if (!data.session) ({ data } = await supabase.auth.signInAnonymously());
      if (data.session) {
        setRegistered(!data.session.user.is_anonymous);
        const studyData = await loadStudyData();
        setSubjects(studyData.subjects);
        setSettings(studyData);
        setLessons(await loadDailyLessons());
      }
      setLoading(false);
    }
    void load();
  }, []);

  useEffect(() => {
    if (!loading && settings && subjects.length > 0 && selectedDay === 0 && !autoOpened.current) {
      autoOpened.current = true;
      void openDay(requestedDay.current);
    }
  }, [loading, settings, subjects.length, selectedDay]);

  useEffect(() => {
    if (!registered || !lesson || questions.length === 0 || index < questions.length || awardedDays.has(selectedDay)) return;
    setAwardedDays((days) => new Set(days).add(selectedDay));
    void awardQuizXp(selectedDay, score).catch(() => undefined);
  }, [registered, lesson, questions.length, index, selectedDay, score, awardedDays]);

  async function openDay(day: number) {
    if (!settings) return;
    setSelectedDay(day); setIndex(-1); setSelected(null); setScore(0); setStreak(0); setError('');
    let lesson = lessons.get(day);
    if (!lesson) {
      setGenerating(true);
      try {
        lesson = await generateDailyLesson(day, getTotalStudyDays(subjects, settings.studyDaysPerWeek), subjects, settings, Array.from(lessons.values()));
        setLessons((current) => new Map(current).set(day, lesson!));
      } catch (problem) {
        setError(problem instanceof Error ? problem.message : 'Не удалось создать урок');
      } finally { setGenerating(false); }
    }
    if (lesson) setQuestions(lessonQuestions(lesson));
  }

  function answer(answerIndex: number) {
    setSelected(answerIndex);
    if (answerIndex === questions[index].correctIndex) { setScore((value) => value + 10); setStreak((value) => value + 1); }
    else setStreak(0);
  }

  function next() { setSelected(null); setIndex((value) => value + 1); }
  if (loading) return <main className="centered">Готовлю маршрут…</main>;
  if (!settings || subjects.length === 0) return <main className="practice-page"><section className="game-empty"><span>🗺️</span><h1>Сначала создай план</h1><p>Добавь предметы и даты экзаменов — после этого появится маршрут по дням.</p><Link href="/" className="link-button">К плану</Link></section></main>;

  return (
    <main className="practice-page daily-page">
      <header className="practice-header"><Link href="/">← Настройки</Link><div className="game-stats"><span>🔥 {streak}</span><b>⭐ {score} XP</b><HistoryLink /><Link href="/account">{registered ? 'Мой герой' : 'Получить героя'}</Link></div></header>
      <div className="route-heading"><span>Твой маршрут</span><h1>{totalDays} учебных дней до экзаменов</h1><p>По {settings.dailyMinutes} минут · {settings.studyDaysPerWeek} дней в неделю</p></div>
      <DayNavigator total={totalDays} selected={selectedDay} readyDays={new Set(lessons.keys())} onSelect={(day) => void openDay(day)} />
      {generating && <div className="day-loading"><span>✨</span><h2>Создаю новый урок для дня {selectedDay}</h2><p>Подбираю следующий материал, пример и новые вопросы…</p></div>}
      {error && <div className="day-error"><p>{error}</p><button onClick={() => void openDay(selectedDay)}>Попробовать снова</button></div>}
      {!selectedDay && !generating && <div className="choose-day"><span>☝️</span><h2>Выбери день</h2><p>Нажми «День 1», чтобы получить первый урок. Следующий день откроет новый материал.</p></div>}
      {lesson && index === -1 && <LessonBrief lesson={lesson} onStart={() => { setSelected(null); setIndex(0); }} />}
      {lesson && index >= 0 && index < questions.length && <><div className="progress-track"><span style={{ width: `${(index / questions.length) * 100}%` }}></span></div><p className="round-number">Вопрос {index + 1} из {questions.length}</p><QuizRound question={questions[index]} selected={selected} onSelect={answer} onNext={next} isLast={index === questions.length - 1} /></>}
      {lesson && questions.length > 0 && index >= questions.length && <section className="result-card"><span>🏆</span><h1>День {selectedDay} пройден!</h1><strong>{score} XP</strong><p>Правильных ответов: {score / 10} из {questions.length}</p>{!registered && <Link href="/account" className="link-button">Сохранить XP и получить героя</Link>}{selectedDay < totalDays && <button onClick={() => void openDay(selectedDay + 1)}>Перейти к дню {selectedDay + 1} →</button>}</section>}
    </main>
  );
}
