import { Route, Switch } from 'wouter';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PracticePage } from './pages/PracticePage';
import { AccountPage } from './pages/AccountPage';
import { HistoryPage } from './pages/HistoryPage';

// Здесь живут только маршруты. Сами экраны складывай в src/pages/.
export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/study" component={PracticePage} />
      <Route path="/practice" component={PracticePage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/history" component={HistoryPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}
