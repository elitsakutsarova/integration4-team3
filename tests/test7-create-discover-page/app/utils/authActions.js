// a helper function for logging users in and handling login errors

import * as authStore from './authStore';
import { applySignedInUser } from './authSession';
import { revalidateApp } from './revalidateApp';

export async function signInAccount(payload) {
  const result = await authStore.signIn(payload);
  if (result.user) {
    await applySignedInUser(result.user);
    revalidateApp();
  }
  return result;
}

export async function signUpAccount(payload) {
  const result = await authStore.signUp(payload);
  if (result.user) {
    await applySignedInUser(result.user);
    revalidateApp();
  }
  return result;
}

export function loginActionError(error, email = '') {
  if (error.field === 'form') {
    return { formError: error.message, email };
  }
  return {
    email,
    fieldErrors: { [error.field]: error.message },
  };
}

export function registerActionError(error, fields = {}) {
  const { username = '', email = '', role = '' } = fields;
  if (error.field === 'form') {
    return { formError: error.message, username, email, role };
  }
  return {
    username,
    email,
    role,
    fieldErrors: { [error.field]: error.message },
  };
}
