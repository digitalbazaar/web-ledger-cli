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
 */
api.attachEd25519SignatureProof = async function({operation, options}) {
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
 * @returns {Promise}
 */
api.attachEquihashProof = async function({operation, options}) {
  const {mode, ...parameters} = options;

  let nParam;
  let kParam;
  if(parameters) {
    if(!(typeof parameters.equihashParameterN === 'number' &&
        typeof parameters.equihashParameterK === 'number')) {
      throw new TypeError(
        '`parameters.equihashParameterN` and `parameters.equihashParameterK`' +
        ' must be integers.');
    }
    nParam = parameters.equihashParameterN;
    kParam = parameters.equihashParameterK;
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
