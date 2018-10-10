/*!
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const jsonld = require('jsonld')();
const jsigs = require('jsonld-signatures');
const eproofs = require('equihash-signature');

const contexts = {
  'https://w3id.org/veres-one/v1': require('veres-one-context')
};
const documentLoader = jsonld.documentLoader;

jsonld.documentLoader = async url => {
  if(url in contexts) {
    return {
      contextUrl: null,
      documentUrl: url,
      document: contexts[url]
    };
  }
  return documentLoader(url);
};

jsigs.use('jsonld', jsonld);
eproofs.install(jsigs);

const api = {};
module.exports = api;

const WEB_LEDGER_CONTEXT_V1_URL = 'https://w3id.org/webledger/v1';

/**
 * Add an Ed25519 Signature proof to an operation.
 *
 * @param {string} operation the operation to be signed.
 * @param {string} options.capability the id of the capability.
 * @param {string} options.capabilityAction the action associated with the
 *                                          capability.
 * @param {string} options.creator the creator of the signature.
 * @param {string} options.privateKeyBase58 the private key to be used for
 *                                          signing.
 * @param {string} options.proofPurpose the purpose of the proof.
 *
 * @returns {Promise<Operation>} a Promise that resolves to a signed operation.
 */
api.attachEd25519SignatureProof = async ({operation, options}) => {
  const {
    capability,
    capabilityAction,
    creator,
    privateKeyBase58,
    proofPurpose
  } = options;

  const algorithm = 'Ed25519Signature2018';

  return jsigs.sign(operation, {
    algorithm,
    creator,
    privateKeyBase58,
    proof: {
      '@context': WEB_LEDGER_CONTEXT_V1_URL,
      proofPurpose,
      capability,
      capabilityAction
    }
  });
};

/**
 * Adds an Equihash proof of work to an operation.
 *
 * @param {string} operation the operation to be signed.
 * @param {string} options.mode the mode of the ledger.
 * @param {string} options.equihashParameterN the N equihash parameter.
 * @param {string} options.equihashParameterK the K equihash parameter.
 *
 * @returns {Promise<Operation>} a Promise that resolves to a signed operation.
 */
api.attachEquihashProof = async ({operation, options}) => {
  const {mode, equihashParameterN, equihashParameterK} = options;

  let nParam;
  let kParam;
  if(equihashParameterN && equihashParameterK) {
    if(!(typeof equihashParameterN === 'number' &&
        typeof equihashParameterK === 'number')) {
      throw new TypeError(
        '`equihashParameterN` and `equihashParameterK` must be integers.');
    }
    nParam = equihashParameterN;
    kParam = equihashParameterK;
  } else {
    switch(mode) {
      case 'dev':
      case 'test':
        nParam = 64;
        kParam = 3;
        break;
      case 'live':
        // FIXME: determine from ledger options
        nParam = 144;
        kParam = 5;
        break;
      default:
        throw new Error('"mode" must be "dev", "test", or "live".');
    }
  }

  return jsigs.sign(operation, {
    algorithm: 'EquihashProof2018',
    parameters: {
      n: nParam,
      k: kParam
    }
  });
};
