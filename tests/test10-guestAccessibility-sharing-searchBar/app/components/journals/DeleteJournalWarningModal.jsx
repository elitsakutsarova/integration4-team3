import JournalWarningModal from './JournalWarningModal';

export default function DeleteJournalWarningModal({ open, onKeep, onDelete }) {
  return (
    <JournalWarningModal
      open={open}
      title="Are you sure you want to delete this journal?"
      description="Your journal & its description will be deleted and you won't be able to see it again."
      onClose={onKeep}
      secondaryLabel="Delete journal"
      onSecondary={onDelete}
      secondaryVariant="danger"
      primaryLabel="Keep journal"
      onPrimary={onKeep}
    />
  );
}
