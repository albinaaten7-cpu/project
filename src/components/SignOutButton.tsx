type SignOutButtonProps = {
  busy: boolean;
  onSignOut: () => Promise<void>;
};

export function SignOutButton({ busy, onSignOut }: SignOutButtonProps) {
  return (
    <button
      type="button"
      className="account-sign-out"
      onClick={() => void onSignOut()}
      disabled={busy}
    >
      {busy ? 'Выходим…' : 'Выйти из аккаунта'}
    </button>
  );
}
