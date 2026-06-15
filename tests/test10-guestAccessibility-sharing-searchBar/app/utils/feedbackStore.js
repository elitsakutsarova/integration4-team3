import { FEEDBACK_TABLE } from './supabase.env';
import { validateFeedbackPayload } from './validators';

const LOCAL_STORAGE_KEY = 'memome_feedback';

function readLocalFeedback() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeLocalFeedback(data) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

function saveLocalFeedback(userId, payload) {
  const key = userId ?? 'guest';
  const all = readLocalFeedback();
  const entries = Array.isArray(all[key]) ? all[key] : [];

  const entry = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    auth_id: key,
    ...payload,
  };

  all[key] = [entry, ...entries];
  writeLocalFeedback(all);
  return entry;
}

async function saveSupabaseFeedback(client, userId, payload) {
  const { error } = await client.from(FEEDBACK_TABLE).insert({
    auth_id: userId,
    name: payload.name,
    email: payload.email,
    subject: payload.subject,
    message: payload.message,
  });

  if (error) {
    console.warn('[MemMe] Feedback insert failed:', error.message);
    return { error: { field: 'form', message: 'Could not save your feedback. Try again later.' } };
  }

  return { ok: true };
}

export async function submitFeedback(payload, context = null) {
  const validated = validateFeedbackPayload(payload);
  if (validated.field) return { error: validated };

  if (context?.client && context?.userId) {
    const result = await saveSupabaseFeedback(context.client, context.userId, validated);
    if (result.error) return result;
    return { success: true };
  }

  if (!context?.userId) {
    return { error: { field: 'form', message: 'You must be signed in to send feedback.' } };
  }

  const entry = saveLocalFeedback(context.userId, validated);
  return { success: true, feedbackId: entry.id };
}
