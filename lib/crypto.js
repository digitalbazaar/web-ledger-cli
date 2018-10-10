/*!
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const base64url = require('base64url');
const crypto = require('crypto');
const {promisify} = require('util');

// Default Initial Value as specified by RFC3394
// https://tools.ietf.org/html/rfc3394#section-2.2.3.1
const AES_KW_IV = Buffer.from('A6A6A6A6A6A6A6A6', 'hex');

const api = {};
module.exports = api;

/**
 * Wraps (encrypts) the a key using password-based encryption.
 * This method will derive a 256-bit AES-KW key from a password using
 * PBKDF2 and use it to wrap the key. The resulting wrapped
 * key is represented as a JWE with an `encrypted_key`.
 *
 * @param {string} password the password to use.
 *
 * @return {Promise<JWE>} a Promise that resolves to an encrypted key JWE.
 */
api.wrapWithPassword = async ({password, key}) => {
  // derive wrapping key
  const salt = crypto.randomBytes(32);
  const iterations = 4096;
  const wrappingKey = await promisify(crypto.pbkdf2)(
    password, salt, iterations, 32, 'sha512');

  const cipher = crypto.createCipheriv(
    'id-aes256-wrap', wrappingKey, AES_KW_IV);
  const wrappedKey = Buffer.concat([cipher.update(key), cipher.final()]);

  const unprotected = {
    alg: 'PBES2-HS512+A256KW',
    p2c: iterations,
    p2s: base64url.encode(salt)
  };

  return {
    unprotected,
    encrypted_key: base64url.encode(wrappedKey)
  };
};

/**
 * Unwraps (decrypts) an encrypted key JWE using password-based encryption.
 * The JWE must contain an encrypted key. This method will derive
 * a 256-bit AES-KW key from a password using PBKDF2 and use it to unwrap the
 * key. A key is returned as a result of this operation.
 *
 * @param {string} password the password to use.
 *
 * @return {Promise<Buffer>} a Promise that resolves to a key.
 */
api.unwrapWithPassword = async ({password, jwe}) => {
  if(!(jwe && typeof jwe === 'object')) {
    throw new TypeError('"jwe" must be an object.');
  }
  // validate header
  const header = jwe.unprotected;
  if(!(header && typeof header === 'object' &&
    header.alg === 'PBES2-HS512+A256KW' &&
    typeof header.p2s === 'string' &&
    Number.isInteger(header.p2c))) {
    throw new Error('Invalid or unsupported JWE header.');
  }
  // validate encrypted_key
  if(typeof jwe.encrypted_key !== 'string') {
    throw new Error('Invalid or missing "encrypted_key".');
  }

  // derive unwrapping key
  const salt = base64url.toBuffer(header.p2s);
  const iterations = header.p2c;
  const unwrappingKey = await promisify(crypto.pbkdf2)(
    password, salt, iterations, 32, 'sha512');

  // unwrap key
  const wrappedKey = base64url.toBuffer(jwe.encrypted_key);
  const decipher = crypto.createDecipheriv(
    'id-aes256-wrap', unwrappingKey, AES_KW_IV);
  const unwrappedKey = Buffer.concat([
    decipher.update(wrappedKey),
    decipher.final()
  ]);

  return unwrappedKey;
};
