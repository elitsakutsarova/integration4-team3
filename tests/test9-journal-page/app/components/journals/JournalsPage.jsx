import { useMemo } from 'react';
import BottomNav from '../BottomNav';
import JournalCard, { NewJournalCard } from './JournalCard';
import JournalsDecorations from './JournalsDecorations';
import JournalsEmptyState from './JournalsEmptyState';
import { buildJournalsFromMemos } from '../../utils/journalBuilder';

export default function JournalsPage({ memos, ready }) {
  const journals = useMemo(() => buildJournalsFromMemos(memos), [memos]);

  return (
    <div className="journals-page">
      <JournalsDecorations />

      <div className={`journals-content${ready && journals.length === 0 ? ' journals-content--empty' : ''}`}>
        {!ready ? (
          <p className="journals-loading">Loading your journals…</p>
        ) : journals.length === 0 ? (
          <JournalsEmptyState />
        ) : (
          <div className="journals-grid">
            {journals.map((journal) => (
              <JournalCard key={journal.id} journal={journal} />
            ))}
            <NewJournalCard />
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
