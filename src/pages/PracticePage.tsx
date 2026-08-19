import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { DayNavigator } from '../components/DayNavigator';
import { LessonBrief } from '../components/LessonBrief';
import { LessonLoader } from '../components/LessonLoader';
import { QuizRound } from '../components/QuizRound';
import { QuizResult } from '../components/QuizResult';
import { TodayCard } from '../components/TodayCard';
import { completeDailyLesson, generateDailyLessonCore, getTotalStudyDays, lessonMatchesTarget, lessonQuestions, loadDailyLessons, saveDailyLesson, type DailyLesson } from '../lib/dailyLessons';
import { loadStudyData, type StudySettings } from '../lib/studyData';
import type { PracticeQuestion } from '../lib/practice';
import type { Subject } from '../lib/studyPlanner';
import { supabase } from '../lib/supabase';
import { awardQuizXp } from '../lib/profile';
import { loadQuizSessions, loadTopicInsights, restartQuizSession, saveQuizAnswer, type QuizSession } from '../lib/quizProgress';
import { HistoryLink } from '../components/HistoryLink';

export function PracticePage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [settings, setSettings] = useState<StudySettings | null>(null);
  const [lessons, setLessons] = useState(new Map<number, DailyLesson>());
  const [selectedDay, setSelectedDay] = useState(0);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [index, setIndex] = useState(-1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mistakes, setMistakes] = useState<PracticeQuestion[]>([]);
  const [mainQuestionCount, setMainQuestionCount] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [sessions, setSessions] = useState(new Map<number, QuizSession>());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [quizGenerating, setQuizGenerating] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [awardedDays, setAwardedDays] = useState(new Set<number>());
  const autoOpened = useRef(false);
  const requestedDay = useRef(Math.max(1, Number(new URLSearchParams(window.location.search).get('day')) || 1));
  const totalDays = settings && subjects.length ? getTotalStudyDays(settings.planDays) : 0;
  const lesson = lessons.get(selectedDay);
  const todayDay = Math.min(totalDays || 1, Array.from({ length: totalDays }, (_, index) => index + 1).find((day) => !sessions.get(day)?.completed) ?? totalDays);
  const todaySession = sessions.get(todayDay);

  useEffect(() => {
    async function load() {
      let { data } = await supabase.auth.getSession();
      if (!data.session) ({ data } = await supabase.auth.signInAnonymously());
      if (data.session) {
        setRegistered(!data.session.user.is_anonymous);
        const studyData = await loadStudyData();
        setSubjects(studyData.subjects);
        setSettings(studyData);
        const [dailyLessons, quizSessions] = await Promise.all([loadDailyLessons(), loadQuizSessions()]);
        setLessons(dailyLessons); setSessions(quizSessions);
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
    setSelectedDay(day); setIndex(-1); setScore(0); setStreak(0); setMistakes([]); setReviewMode(false); setQuestions([]); setError('');
    let dailyLesson = lessons.get(day);
    let savedSession = sessions.get(day);
    if (dailyLesson && !lessonMatchesTarget(dailyLesson, day, subjects)) {
      dailyLesson = undefined;
      savedSession = undefined;
      setLessons((current) => { const next = new Map(current); next.delete(day); return next; });
      setSessions((current) => { const next = new Map(current); next.delete(day); return next; });
      void restartQuizSession(day).catch(() => undefined);
    }
    if (dailyLesson && lessonQuestions(dailyLesson).length >= 10) {
      const nextQuestions = lessonQuestions(dailyLesson);
      setQuestions(nextQuestions); setMainQuestionCount(nextQuestions.length);
      if (savedSession) {
        setIndex(savedSession.completed ? nextQuestions.length : savedSession.currentIndex);
        setScore(savedSession.score); setStreak(savedSession.streak); setMistakes(savedSession.mistakes);
      }
      return;
    }
    if (!dailyLesson) {
      setGenerating(true);
      try {
        const insights = await loadTopicInsights();
        dailyLesson = await generateDailyLessonCore(day, getTotalStudyDays(settings.planDays), subjects, settings, Array.from(lessons.values()), insights);
        setLessons((current) => new Map(current).set(day, dailyLesson!));
      } catch (problem) {
        setError(problem instanceof Error ? problem.message : 'Не удалось создать конспект');
      } finally { setGenerating(false); }
    }
    if (!dailyLesson) return;
    if (lessonQuestions(dailyLesson).length < 10) {
      setQuizGenerating(true);
      try {
        const previousQuestions = Array.from(lessons.values()).flatMap((item) => lessonQuestions(item).map((question) => question.question));
        dailyLesson = await completeDailyLesson(dailyLesson, settings, previousQuestions);
        setLessons((current) => new Map(current).set(day, dailyLesson!));
        void saveDailyLesson(day, dailyLesson).catch(() => setError('Урок открыт, но не сохранился. Проверь соединение.'));
      } catch (problem) {
        setError(problem instanceof Error ? problem.message : 'Не удалось создать квиз');
      } finally { setQuizGenerating(false); }
    }
    if (lessonQuestions(dailyLesson).length >= 10) {
      const nextQuestions = lessonQuestions(dailyLesson);
      setQuestions(nextQuestions); setMainQuestionCount(nextQuestions.length);
      if (savedSession) { setIndex(savedSession.completed ? nextQuestions.length : savedSession.currentIndex); setScore(savedSession.score); setStreak(savedSession.streak); setMistakes(savedSession.mistakes); }
    }
  }

  function answer(isCorrect: boolean) {
    if (reviewMode) return;
    const nextScore = score + (isCorrect ? 10 : 0);
    const nextStreak = isCorrect ? streak + 1 : 0;
    const nextMistakes = isCorrect ? mistakes : [...mistakes, questions[index]];
    setScore(nextScore); setStreak(nextStreak); setMistakes(nextMistakes);
    setSessions((current) => new Map(current).set(selectedDay, { dayNumber: selectedDay, currentIndex: index + 1, score: nextScore, streak: nextStreak, mistakes: nextMistakes, completed: index === questions.length - 1 }));
    void saveQuizAnswer(selectedDay, index, questions[index], isCorrect, nextScore, nextStreak, nextMistakes, index === questions.length - 1).catch(() => setError('Не удалось сохранить прогресс квиза.'));
  }

  function next() { setIndex((value) => value + 1); }
  if (loading) return <main className="centered">Готовлю маршрут…</main>;
  if (!settings || subjects.length === 0) return <main className="practice-page"><section className="game-empty"><span>🗺️</span><h1>Сначала создай план</h1><p>Добавь предметы и темы — после этого появится маршрут по дням.</p><Link href="/setup" className="link-button">К настройке</Link></section></main>;

  return (
    <main className="practice-page daily-page">
      <header className="practice-header"><Link href="/setup">← Настройки</Link><div className="game-stats"><span>🔥 {streak}</span><b>⭐ {score} XP</b><Link href="/mistakes">Ошибки</Link><HistoryLink /><Link href="/account">{registered ? 'Профиль' : 'Вход / регистрация'}</Link></div></header>
      <TodayCard day={todayDay} subject={subjects[0]?.name} minutes={settings.dailyMinutes} currentIndex={todaySession?.currentIndex ?? 0} totalQuestions={10} onOpen={() => void openDay(todayDay)} />
      <div className="route-heading"><span>Твой маршрут</span><h1>{totalDays} учебных дней в твоём плане</h1><p>По {settings.dailyMinutes} минут · всего {totalDays} занятий</p></div>
      <DayNavigator total={totalDays} selected={selectedDay} readyDays={new Set(Array.from(lessons.entries()).filter(([, item]) => lessonQuestions(item).length >= 10).map(([day]) => day))} onSelect={(day) => void openDay(day)} />
      {generating && <LessonLoader day={selectedDay} subject={subjects[0]?.name} />}
      {error && <div className="day-error"><p>{error}</p><button onClick={() => void openDay(selectedDay)}>Попробовать снова</button></div>}
      {!selectedDay && !generating && <div className="choose-day"><span>☝️</span><h2>Выбери день</h2><p>Нажми «День 1», чтобы получить первый урок. Следующий день откроет новый материал.</p></div>}
      {lesson && index === -1 && <LessonBrief lesson={lesson} quizLoading={quizGenerating} onStart={() => setIndex(0)} />}
      {lesson && index >= 0 && index < questions.length && <><div className="progress-track"><span style={{ width: `${(index / questions.length) * 100}%` }}></span></div><p className="round-number">Вопрос {index + 1} из {questions.length}</p><QuizRound key={`${selectedDay}-${index}`} question={questions[index]} onAnswer={answer} onNext={next} isLast={index === questions.length - 1} /></>}
      {lesson && questions.length > 0 && index >= questions.length && <QuizResult day={selectedDay} totalDays={totalDays} score={score} totalQuestions={mainQuestionCount} mistakes={mistakes} registered={registered} reviewMode={reviewMode} onReview={() => { setQuestions(mistakes); setIndex(0); setReviewMode(true); }} onNextDay={() => void openDay(selectedDay < totalDays ? selectedDay + 1 : selectedDay)} />}
    </main>
  );
}
