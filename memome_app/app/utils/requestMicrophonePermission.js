/** Prompts for microphone access via getUserMedia; releases the stream immediately. */
export async function requestMicrophonePermission() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return { granted: true };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return { granted: true };
  } catch (err) {
    const name = err?.name ?? '';
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
      return { granted: false, denied: true };
    }
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      return { granted: false, denied: false, message: 'No microphone found.' };
    }
    return { granted: true };
  }
}
