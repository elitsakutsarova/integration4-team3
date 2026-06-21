// a helper function for logging users in and handling login errors

import * as authStore from './authStore';
import { applySignedInUser } from './authSession';
import { LOGIN_EMAIL_ERROR, LOGIN_PASSWORD_ERROR } from './loginErrors';

export { LOGIN_EMAIL_ERROR, LOGIN_PASSWORD_ERROR };

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
  if (error.fieldErrors) {
    return {
      email: error.email ?? email,
      password: error.password ?? password,
      fieldErrors: error.fieldErrors,
    };
  }
  if (
    error.field === 'form'
    && /incorrect username or email|incorrect email or password|invalid credentials/i.test(error.message ?? '')
  ) {
    return {
      email,
      password,
      fieldErrors: { password: LOGIN_PASSWORD_ERROR },
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
