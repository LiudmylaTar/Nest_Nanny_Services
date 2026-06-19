import { Matches, ValidationOptions } from 'class-validator';

export const NO_WHITESPACE_REGEX = /^\S+$/;

export const LATIN_PASSWORD_REGEX = /^[a-zA-Z0-9!@#$%^&*_.-]+$/;

export function NoWhitespace(validationOptions?: ValidationOptions) {
  return Matches(NO_WHITESPACE_REGEX, {
    message: 'Must not contain spaces',
    ...validationOptions,
  });
}

export function IsLatinPassword(validationOptions?: ValidationOptions) {
  return Matches(LATIN_PASSWORD_REGEX, {
    message:
      'Password must contain only Latin letters, numbers, and !@#$%^&*_.-',
    ...validationOptions,
  });
}
