pragma solidity ^0.8.0;

import './TokenBase.sol';

contract TokenIotaEvm is TokenBase {
  constructor() TokenBase('IOTA EVM Token', 'IETK') {}
}
