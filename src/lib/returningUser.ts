const INTRO_SEEN_KEY = 'track_intro_seen';

export function hasSeenIntro() {
  return window.localStorage.getItem(INTRO_SEEN_KEY) === 'yes';
}

export function rememberIntroVisit() {
  window.localStorage.setItem(INTRO_SEEN_KEY, 'yes');
}
