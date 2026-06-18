import JournalWarningModal from './journals/JournalWarningModal';

export default function EditMemoWarningModal({ open, onContinue, onDiscard }) {
  return (
    <JournalWarningModal
      open={open}
      title="Are you sure you want to close this page without saving your edits?"
      description="Your edits won't be saved"
      primaryLabel="Continue editing"
      onPrimary={onContinue}
      onClose={onContinue}
      secondaryLabel="Discard changes"
      onSecondary={onDiscard}
    />
  );
}
