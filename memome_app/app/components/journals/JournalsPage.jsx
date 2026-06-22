import { useEffect, useMemo, useState } from 'react';
import BottomNav from '../BottomNav';
import JournalCard, { NewJournalCard } from './JournalCard';
import JournalsDecorations from './JournalsDecorations';
import JournalsEmptyState from './JournalsEmptyState';
import { useCustomJournals } from '../../context/CreateJournalContext';
import { buildJournalsFromMemos } from '../../utils/journalBuilder';
import { readLastNewJournalId } from '../../utils/journalNewBadge';

export default function JournalsPage({ memos, ready }) {
  const { customJournals } = useCustomJournals();
  const [lastNewJournalId, setLastNewJournalId] = useState(() => readLastNewJournalId());
  const journals = useMemo(
    () => buildJournalsFromMemos(memos, customJournals),
    [customJournals, memos],
  );

  useEffect(() => {
    setLastNewJournalId(readLastNewJournalId());
  }, [customJournals]);

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
              <JournalCard
                key={journal.id}
                journal={journal}
                isNew={journal.id === lastNewJournalId}
              />
            ))}
            <NewJournalCard />
          </div>
        )}
      </div>


      <BottomNav />
    </div>
  );
}
