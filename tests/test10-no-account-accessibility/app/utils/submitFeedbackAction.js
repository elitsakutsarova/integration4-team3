import { bootstrapAuthSession, getAuthSnapshot } from './authSession';
import { submitFeedback } from './feedbackStore';

const ALLOWED_INTENTS = new Set(['submit-feedback']);

function feedbackErrorToFieldMap(error) {
  if (!error) return {};
  if (error.field) return { [error.field]: error.message };
  return { form: error.message };
}

export async function submitFeedbackAction(request, serverContext = null) {
  if (!serverContext) {
    await bootstrapAuthSession();
  }

  const formData = await request.formData();
  const intent = String(formData.get('intent') ?? '').trim();

  if (!ALLOWED_INTENTS.has(intent)) {
    return { error: { field: 'form', message: 'Unknown action.' } };
  }

  const userId = serverContext?.userId ?? getAuthSnapshot().user?.id ?? null;
  const result = await submitFeedback(
    {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    },
    serverContext ? { client: serverContext.client, userId } : { userId },
  );

  if (result.error) {
    return { error: result.error, fieldErrors: feedbackErrorToFieldMap(result.error) };
  }

  return { success: true, feedbackId: result.feedbackId };
}

export { feedbackErrorToFieldMap };
