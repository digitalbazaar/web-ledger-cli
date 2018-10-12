# Web Ledger CLI _(web-ledger-cli)_

<!-- [![Build Status](https://travis-ci.org/digitalbazaar/web-ledger-cli.png?branch=master)](https://travis-ci.org/digitalbazaar/web-ledger-cli) -->

> An CLI tool to interact with Web Ledgers

## Table of Contents

- [Security](#security)
- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Contribute](#contribute)
- [Commercial Support](#commercial-support)
- [License](#license)

## Security

TBD

## Background

This tool provides a CLI to interact with Web Ledgers.

See also (related specs):

* [Web Ledger Protocol](https://w3c.github.io/web-ledger/)
* [Linked Data Proofs](https://w3c-dvcg.github.io/ld-proofs/)

## Install

Requires Node.js 8.3+

To install via NPM:

```
npm install web-ledger-cli
```

## Usage

Use the specified command below to view the command line options:
```
$ wl --help
```
```
wl <command>

Commands:
  wl create    Create record
  wl encrypt   Encrypt private key
  wl get <id>  Get record
  wl update    Update record

Options:
  --version      Show version number                                   [boolean]
  -h, --help     Show help                                             [boolean]
  -v, --verbose  Increase verbosity                                      [count]
  -q, --quiet    Quiet output                                          [boolean]

Examples:
  wl COMMAND -h                             Show help and more examples for
                                            COMMAND
  wl create -r record.json -c config.json   Create record from JSON file
  wl update -r patch.json -c config.json    Update record from JSON file
  wl encrypt                                Encrypt the private key file secured
                                            by a password
  wl get --hostname webledger.io urn:foo    Get record by ID
```

### Config File
The CLI tool requires the use of a config file for creating and updating records.

**hostname _(required)_**
> The hostname of the Web Ledger.

**proofs _(required)_**
> The array of Linked Data digital proof specifications.

- **type _(required)_**: The URL identifying the digital [proof suite](https://w3c-dvcg.github.io/ld-proofs/#dfn-proof-suite).

**config.example.json**
``` json
{
  "hostname": "genesis.veres.one.localhost:42443",
  "proofs": [
    {
      "type": "EquihashProof2018",
      "equihashParameterK": 3,
      "equihashParameterN": 64
    },
    {
      "type": "Ed25519Signature2018",
      "capability": "did:v1:test:nym:aKjhx7cWiqVSNxz5n8yYh3Lqs1pqRSbziRC5pCEC9DF",
      "capabilityAction": "RegisterDid",
      "creator": "did:v1:test:nym:aKjhx7cWiqVSNxz5n8yYh3Lqs1pqRSbziRC5pCEC9DF#ocap-invoke-key-1",
      "privateKeyBase58Path": "/home/user/web-ledger-cli/examples/privateKeyBase58.encrypted.json",
      "proofPurpose": "capabilityInvocation"
    }
  ]
}
```

Note that the `Ed25519Signature2018` signature suite does NOT specify the `privateKeyBase58` but rather the `privateKeyBase58Path`. It is good security practice to never leave one's private key in plain text. This tool requires one to provide the path to their encrypted private key as the value to the `privateKeyBase58Path` property. More information on how to create the desired encrypted private key file can be found in section [foo](#foo). 

### Record File
The CLI tool requires the use of a record file that contains the record or record patch in order to create or update a record respectively.

**create-record.example.json**
``` json
{
  "@context": "https://w3id.org/veres-one/v1",
  "id": "did:v1:test:uuid:2d909c9c-d279-495e-b471-5d0583f6cfb3",
  "electorPool": [{
    "id": "https://node-1/consensus/continuity2017/voters/z6MkkhRj9ppXQdU6CRNNfYbfoLNz212udKVJn3J52731CCkf",
    "type": ["Elector", "RecoveryElector"],
    "capability": "did:v1:nym:BcNkgGmGEpCGSJSMPB4BvWvwVM6YeTR52BSWcZTbzU23"
  }]
}
```

**update-record.example.json**
``` json
{
  "@context": "https://w3id.org/veres-one/v1",
  "target": "did:v1:test:uuid:2d909c9c-d279-495e-b471-5d0583f6cfb3",
  "sequence": 0,
  "patch": [{
    "op": "add",
    "path": "/electorPool/1",
    "value": {
      "id": "https://node-2/consensus/continuity2017/voters/z6MkkhRj9ppXQdU6CRNNfYbfoLNz212udKVJn3J52731CCkf",
      "type": [
        "Elector",
        "RecoveryElector"
      ],
      "capability": "did:v1:nym:BcNkgGmGEpCGSJSMPB4BvWvwVM6YeTR52BSWcZTbzU23"
    }
  }]
}
```
### PrivateKeyBase58 File
The CLI tool requires the use of a private key file that contains private key
material. This file will be encrypted and then deleted.

**privateKeyBase58.example.json**
``` json
{
  "@context": "https://w3id.org/security/v2",
  "privateKeyBase58": "3wxQ3ASQ1prSdrzTciZwDaPBhEAmqrBfFeGbyhB5SPWSCocXTAMw8ezjsDMSQuw6fvFU9gAjj9opBDpqVrctey6J"
}

```

### Encrypting Your Private Key
1. Extract the necessary private key material that is needed to succesfully create your Linked Data Signature. Create a [PrivateKeyBase58](#PrivateKeyBase58) file using the private key material as the value for `privateKeyBase58`.
2. Run the command
``` bash
$ wl encrypt
```
3. Follow the steps.

    a. Specify the path to the private key file

    b. Enter the password to use for encryption

4. If successful the encrypted private key material will be written on disk. The file can be found in the same directory that the original private key exists.

5. Upon completion, delete the original private key.

### Create Record
``` bash
$ wl create -r /path/to/record.json -c /path/to/config.json
```

### Update Record
``` bash
$ wl update -r /path/to/patch.json -c /path/to/config.json
```

### Get Record
``` bash
$ wl get --hostname example-hostname.com urn:example:id
```

## Contribute

See [the contribute file](https://github.com/digitalbazaar/bedrock/blob/master/CONTRIBUTING.md)!

PRs accepted.

Small note: If editing the Readme, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## Commercial Support

Commercial support for this library is available upon request from
Digital Bazaar: support@digitalbazaar.com

## License

[New BSD License (3-clause)](LICENSE) © Digital Bazaar
