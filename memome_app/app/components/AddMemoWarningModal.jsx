import JournalWarningModal from './journals/JournalWarningModal';

export default function AddMemoWarningModal({ open, onContinue, onDiscard }) {
  return (
    <JournalWarningModal
      open={open}
      title="Are you sure you want to close this page without saving your memo?"
      description="Your memo won't be saved"
      primaryLabel="Continue editing"
      onPrimary={onContinue}
      onClose={onContinue}
      secondaryLabel="Discard changes"
      onSecondary={onDiscard}
    />
  );
}
