import { Route, Switch } from 'wouter';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PracticePage } from './pages/PracticePage';
import { AccountPage } from './pages/AccountPage';
import { HistoryPage } from './pages/HistoryPage';
import { SetupPage } from './pages/SetupPage';
import { ScrollToTop } from './components/ScrollToTop';
import { DiagnosticPage } from './pages/DiagnosticPage';
import { MistakesPage } from './pages/MistakesPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';

// Здесь живут только маршруты. Сами экраны складывай в src/pages/.
export default function App() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/setup" component={SetupPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/diagnostic" component={DiagnosticPage} />
        <Route path="/mistakes" component={MistakesPage} />
        <Route path="/study" component={PracticePage} />
        <Route path="/practice" component={PracticePage} />
        <Route path="/account" component={AccountPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/history" component={HistoryPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </>
  );
}
