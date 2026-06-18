// a helper function for logging users in and handling login errors

import * as authStore from './authStore';
import { applySignedInUser } from './authSession';

export async function signInAccount(payload) {
  const result = await authStore.signIn(payload);
  if (result.user) {
    await applySignedInUser(result.user);
  }
  return result;
}

export async function signUpAccount(payload) {
  const result = await authStore.signUp(payload);
  if (result.user) {
    await applySignedInUser(result.user);
  }
  return result;
}

export function loginActionError(error, email = '', password = '') {
  if (
    error.field === 'form'
    && /incorrect email or password|invalid credentials/i.test(error.message ?? '')
  ) {
    return {
      email,
      password,
      fieldErrors: {
        email: 'Incorrect username or email',
        password: 'Incorrect password',
      },
    };
  }
  if (error.field === 'form') {
    return { formError: error.message, email, password };
  }
  return {
    email,
    password,
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
