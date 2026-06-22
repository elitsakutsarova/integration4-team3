import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import DraggableSticker from '../diary/DraggableSticker';
import RecapSelectView, { RecapChooseStyleView } from '../diary/RecapViews';
import { diaryPath, paths } from '../../utils/appPaths';
import {
  createSticker,
  loadPageStickers,
  savePageStickers,
  syncDiaryLayoutToStorage,
} from '../../utils/stickerTracker';
import JournalBackButton from './JournalBackButton';
import JournalMemoEntry from './JournalMemoEntry';
import JournalStickerDock from './JournalStickerDock';
import { journalAssets } from '../../utils/journalAssets';

const JOURNAL_CANVAS_PAGE = 0;

function recapSelectionKey(journalId) {
  return `memome_recap_selected_${journalId}`;
}

function readRecapSelectedIds(journalId) {
  if (typeof sessionStorage === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(recapSelectionKey(journalId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function writeRecapSelectedIds(journalId, ids) {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(recapSelectionKey(journalId), JSON.stringify(ids));
}

function clearRecapSelectedIds(journalId) {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(recapSelectionKey(journalId));
}

function getRecapStep(searchParams) {
  const step = searchParams.get('recap');
  return step === 'select' || step === 'choose' ? step : null;
}

function memoLayout(index, memo) {
  if (!memo.mediaPreview?.url) return 'text';
  if (index % 2 === 1) return 'right';
  return 'left';
}

function SuccessToast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="share-success-backdrop" onClick={onClose}>
      <div className="share-success-modal" onClick={(e) => e.stopPropagation()}>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default function JournalDetailPage({
  journal,
  memories,
  backTo = paths.journals,
}) {
  const diaryId = journal.id;
  const [searchParams, setSearchParams] = useSearchParams();
  const recapStep = getRecapStep(searchParams);

  const [pageStickers, setPageStickers] = useState(() => ({
    [JOURNAL_CANVAS_PAGE]: loadPageStickers(diaryId, JOURNAL_CANVAS_PAGE),
  }));
  const [recapSelectedIds, setRecapSelectedIds] = useState(() => (
    recapStep === 'choose' ? readRecapSelectedIds(diaryId) : []
  ));
  const [successMsg, setSuccessMsg] = useState(null);

  const dropZoneRef = useRef(null);
  const trayRef = useRef(null);

  useEffect(() => {
    if (recapStep !== 'choose') return;

    const storedIds = readRecapSelectedIds(diaryId);
    if (!storedIds.length) {
      setSearchParams({ recap: 'select' }, { replace: true });
      return;
    }

    setRecapSelectedIds(storedIds);
  }, [diaryId, recapStep, setSearchParams]);

  function openRecapSelect() {
    syncDiaryLayoutToStorage(diaryId, pageStickers);
    setSearchParams({ recap: 'select' });
  }

  function closeRecapFlow() {
    clearRecapSelectedIds(diaryId);
    setRecapSelectedIds([]);
    setSearchParams({}, { replace: true });
  }

  function openRecapChoose(ids) {
    writeRecapSelectedIds(diaryId, ids);
    setRecapSelectedIds(ids);
    setSearchParams({ recap: 'choose' });
  }

  const handleDropOnPage = useCallback((stickerDef, x, y, targetPageIndex) => {
    const newSticker = createSticker(stickerDef, x, y);
    setPageStickers((prev) => {
      const next = [...(prev[targetPageIndex] ?? []), newSticker];
      savePageStickers(diaryId, targetPageIndex, next);
      return { ...prev, [targetPageIndex]: next };
    });
  }, [diaryId]);

  const handleMoveSticker = useCallback((targetPageIndex, uid, x, y) => {
    setPageStickers((prev) => {
      const page = prev[targetPageIndex] ?? [];
      const next = page.map((s) => (s.uid === uid ? { ...s, x, y } : s));
      savePageStickers(diaryId, targetPageIndex, next);
      return { ...prev, [targetPageIndex]: next };
    });
  }, [diaryId]);

  const handleReturnToTray = useCallback((targetPageIndex, uid) => {
    setPageStickers((prev) => {
      const next = (prev[targetPageIndex] ?? []).filter((s) => s.uid !== uid);
      savePageStickers(diaryId, targetPageIndex, next);
      return { ...prev, [targetPageIndex]: next };
    });
  }, [diaryId]);

  const placedStickers = (pageStickers[JOURNAL_CANVAS_PAGE] ?? []).map((s) => (
    <DraggableSticker
      key={s.uid}
      sticker={s}
      pageIndex={JOURNAL_CANVAS_PAGE}
      diaryId={diaryId}
      dropZoneRef={dropZoneRef}
      trayRef={trayRef}
      onMove={(uid, x, y) => handleMoveSticker(JOURNAL_CANVAS_PAGE, uid, x, y)}
      onReturnToTray={(uid) => handleReturnToTray(JOURNAL_CANVAS_PAGE, uid)}
    />
  ));

  if (recapStep === 'select') {
    return (
      <>
        <RecapSelectView
          memories={memories}
          onBack={closeRecapFlow}
          onContinue={(ids) => {
            syncDiaryLayoutToStorage(diaryId, pageStickers);
            openRecapChoose(ids);
          }}
        />
        <SuccessToast message={successMsg} onClose={() => setSuccessMsg(null)} />
      </>
    );
  }

  if (recapStep === 'choose') {
    return (
      <>
        <RecapChooseStyleView
          journal={journal}
          memories={memories}
          selectedIds={recapSelectedIds}
          onBack={() => setSearchParams({ recap: 'select' })}
          onShared={(msg) => setSuccessMsg(msg)}
        />
        <SuccessToast message={successMsg} onClose={() => setSuccessMsg(null)} />
      </>
    );
  }

  return (
    <div className="journal-detail-page">
      <header className="journal-detail-header">
         <div className="journal-detail-hero-deco" aria-hidden="true">
          <img
            className="journals-hero-logo"
            src={journalAssets.logoMark}
            alt=""
          />
          <img
            className="journals-hero-wave"
            src={journalAssets.headerWave}
            alt=""
          />
          <img
            className="journal-detail-hero-grid"
            src={journalAssets.pixelDeco}
            alt=""
          />
          <div className="journal-detail-hero-grid-pattern grid-pattern" />
        </div>
        <button
          type="button"
          className="journal-detail-share"
          aria-label="Share journal"
          onClick={openRecapSelect}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
            <rect width="26" height="26" fill="#F1F4FF" />
            <path d="M16.25 5.42187C16.25 3.62695 17.7051 2.17188 19.5 2.17188C21.2949 2.17187 22.75 3.62695 22.75 5.42187C22.75 7.2168 21.2949 8.67187 19.5 8.67187C17.7051 8.67187 16.25 7.2168 16.25 5.42187Z" stroke="#1952FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M3.24219 13C3.24219 11.2051 4.69726 9.75 6.49219 9.75C8.28711 9.75 9.74219 11.2051 9.74219 13C9.74219 14.7949 8.28711 16.25 6.49219 16.25C4.69726 16.25 3.24219 14.7949 3.24219 13Z" stroke="#1952FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M16.25 20.5781C16.25 18.7832 17.7051 17.3281 19.5 17.3281C21.2949 17.3281 22.75 18.7832 22.75 20.5781C22.75 22.3731 21.2949 23.8281 19.5 23.8281C17.7051 23.8281 16.25 22.3731 16.25 20.5781Z" stroke="#1952FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M9.30469 14.6328L16.7017 18.9488" stroke="#1952FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M16.6887 7.05469L9.30469 11.3707" stroke="#1952FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
    
        <div className="journal-detail-title-bar">
          <div className="journal-detail-titles">
            <JournalBackButton
              className="journal-detail-back"
              to={backTo}
              label="Back to journals"
            />
          <h1 className="journal-detail-title">{journal.title}</h1>
          </div>
          {/* <div className="settings-title-icon grid-icon">
            <img src={settingsAssets.blueGears} alt="Settings" />
          </div> */}
        </div>
        
        
      </header>

      <div className="journal-detail-scroll">
        {journal.dateRange && (
          <p className="journal-detail-dates">{journal.dateRange}</p>
        )}
        <div
          ref={dropZoneRef}
          className="journal-detail-canvas diary-drop-zone"
        >
          {placedStickers}
          <div className="journal-detail-memos">
            {journal.description?.trim() && (
              <p className="journal-detail-description">{journal.description}</p>
            )}
            {memories.map((memo, index) => (
              <JournalMemoEntry
                key={memo.id}
                memo={memo}
                layout={memoLayout(index, memo)}
              />
            ))}
          </div>

          <div className="journal-detail-wave" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="391" height="86" viewBox="0 0 391 86" fill="none">
            <path d="M529.311 9.57344C400.118 -24.5679 299.879 59.2893 105.171 26.8324C33.7887 14.9333 -80.1233 14.4542 -126.701 43.6372C-160.38 64.7391 -106.297 69.1191 -67.1521 84.6642" stroke="#A3BAFF" stroke-width="2.47" stroke-dasharray="8 8" />
          </svg></div>

          <div className="journal-detail-actions">
            <Link
              to={paths.journalsEdit(journal.id)}
              className="journal-detail-action journal-detail-action--edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 22 24" fill="none">
                <path d="M14.6115 8.55496L12.8069 6.98311L2.45593 18.8724L2.57251 20.5608L4.26052 20.4442L14.6115 8.55496ZM16.1829 6.75L17.7544 4.94504L15.9498 3.37319L14.3783 5.17815L16.1829 6.75ZM5.41388 22.7641L0.349841 23.1138L5.65234e-06 18.0474L14.9308 0.897669C15.1392 0.658359 15.5819 0.149056 15.711 0.000681017C16.0077 0.259106 16.3795 0.572718 16.6188 0.781112L20.2293 3.92592C20.4685 4.13438 20.8349 4.45342 21.1316 4.71184C20.8732 5.00859 20.5542 5.37495 20.3459 5.61432L5.41388 22.7641Z" fill="#1952FF" />
              </svg>
              <span>Edit journal</span>
            </Link>
            <button
              type="button"
              className="journal-detail-action journal-detail-action--recap"
              onClick={openRecapSelect}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <g clip-path="url(#clip0_584_78134)">
                  <path d="M12.102 0.558071C8.83627 0.392176 5.83677 1.67681 3.71332 3.84062L1.06972 0.914056L0.697597 8.23938L8.02292 8.6115L5.57076 5.89687C7.16706 4.20107 9.45203 3.177 11.9625 3.30453C16.5113 3.53561 20.0146 7.40935 19.7833 11.9625C19.552 16.5156 15.6742 20.0144 11.1254 19.7833C8.85095 19.6677 6.83797 18.6405 5.42023 17.0755L3.38201 18.9167C5.27226 21.0047 7.95616 22.3758 10.9858 22.5297C17.0538 22.838 22.2215 18.1699 22.5297 12.102C22.838 6.03402 18.1699 0.866318 12.102 0.558071ZM10.9204 5.77711L10.5483 13.1024L16.0412 13.3815L16.1343 11.5491L12.4738 11.3631L12.7528 5.8702L10.9204 5.77711Z" fill="white" />
                  <rect x="0.819275" y="12.1641" width="3" height="3" transform="rotate(2.90808 0.819275 12.1641)" fill="white" />
                </g>
                <defs>
                  <clipPath id="clip0_584_78134">
                    <rect width="22" height="22" fill="white" transform="translate(1.11615) rotate(2.90808)" />
                  </clipPath>
                </defs>
              </svg>
              <span>Create recap</span>
            </button>
          </div>
        </div>
      </div>

      <JournalStickerDock
        dropZoneRef={dropZoneRef}
        trayRef={trayRef}
        pageIndex={JOURNAL_CANVAS_PAGE}
        onDropOnPage={handleDropOnPage}
      />

      <SuccessToast message={successMsg} onClose={() => setSuccessMsg(null)} />
    </div>
  );
}
