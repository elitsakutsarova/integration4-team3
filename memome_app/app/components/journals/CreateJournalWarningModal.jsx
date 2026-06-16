import JournalWarningModal from './JournalWarningModal';

export default function CreateJournalWarningModal({ open, onContinue, onDiscard }) {
  return (
    <JournalWarningModal
      open={open}
      title="Are you sure you want to close this page without saving your journal?"
      description="Your journal won't be saved"
      primaryLabel="Continue editing"
      onPrimary={onContinue}
      onClose={onContinue}
      secondaryLabel="Discard changes"
      onSecondary={onDiscard}
    />
  );
}
