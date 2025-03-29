## Soroban contract commands

Create and fund account Bob on testnet

Bash:

```
cd soroban

stellar contract build

stellar contract optimize --wasm target/wasm32-unknown-unknown/release/vault.wasm

stellar contract optimize --wasm target/wasm32-unknown-unknown/release/market.wasm

stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/vault.optimized.wasm \
  --source bob \
  --network testnet

stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/market.optimized.wasm \
  --source bob \
  --network testnet

stellar contract invoke \
  --id deployed_market_contract_id \
  --source bob \
  --network testnet \
  -- init \
  --data '{
      "name": "Name",
      "description": "Description",
      "admin_address": "GD...",
      "asset_address": "CB...",
      "trusted_oracle_name": "Oracle",
      "trusted_oracle_address": "GD...",
      "hedge_vault_address": "CD...",
      "risk_vault_address": "CD...",
      "commission_fee": 0,
      "risk_score": 0,
      "is_automatic": true,
      "event_unix_timestamp": 1743281212,
      "lock_period_in_seconds": 0,
      "event_threshold_in_seconds": 0,
      "unlock_period_in_seconds": 0
    }'
```

```

// Example 1

vault hedge
CDNHLHZMU5FL2BPR2RFAZGE3N7I43LIAGOPOPEYE374HKSQ5CVQ5O7SQ

vault risk
CDTZJKJIOZWJWOWCZK2XW433ZT5ULLCPU3NBB6RR73TPAOJVJOLFEEZY

market creator
CCRQTEB2IZU6TFC2GAOVUOIQDPCCMZFQGNUNSFTY3QXF2EMEGGO3FNMG

stellar contract invoke \
  --id CCRQTEB2IZU6TFC2GAOVUOIQDPCCMZFQGNUNSFTY3QXF2EMEGGO3FNMG \
  --source bob \
  --network testnet \
  -- init \
  --data '{
      "name": "San Francisco",
      "description": "San Francisco Bay Area",
      "admin_address": "GDVZSDU6YDZ53CFP4BMMAXDC4Y3UXOXT3N73MXKK2XPSRBJMZXZ5ZFV5",
      "asset_address": "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
      "trusted_oracle_name": "AcurastTEE",
      "trusted_oracle_address": "GDVZSDU6YDZ53CFP4BMMAXDC4Y3UXOXT3N73MXKK2XPSRBJMZXZ5ZFV5",
      "hedge_vault_address": "CDNHLHZMU5FL2BPR2RFAZGE3N7I43LIAGOPOPEYE374HKSQ5CVQ5O7SQ",
      "risk_vault_address": "CDTZJKJIOZWJWOWCZK2XW433ZT5ULLCPU3NBB6RR73TPAOJVJOLFEEZY",
      "commission_fee": 0,
      "risk_score": 0,
      "is_automatic": true,
      "event_unix_timestamp": 1745971200,
      "lock_period_in_seconds": 0,
      "event_threshold_in_seconds": 0,
      "unlock_period_in_seconds": 0
    }'

Wed Apr 30 2025 00:00:00 GMT+0000


// Example 2

vault hedge
CBVVGJTBOILYBA3CSPYHNNHIZTGQPJGAQZ7PQRTZ3SLQEHC6FKGKQ5U2

vault risk
CB6XUGEEFJWEN7OYQGW6UNCFEJLUVOL3IR5YARO3E2UDKRZUB7WMENCZ

market creator
CCXFIZQ6AFYFE3HGCNWRZJLDBNWDXAQGRLVHM4VRQXGC6HN4INT7RBCM

stellar contract invoke \
  --id CCXFIZQ6AFYFE3HGCNWRZJLDBNWDXAQGRLVHM4VRQXGC6HN4INT7RBCM \
  --source bob \
  --network testnet \
  -- init \
  --data '{
      "name": "San Francisco",
      "description": "San Francisco Bay Area",
      "admin_address": "GDVZSDU6YDZ53CFP4BMMAXDC4Y3UXOXT3N73MXKK2XPSRBJMZXZ5ZFV5",
      "asset_address": "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
      "trusted_oracle_name": "AcurastTEE",
      "trusted_oracle_address": "GDVZSDU6YDZ53CFP4BMMAXDC4Y3UXOXT3N73MXKK2XPSRBJMZXZ5ZFV5",
      "hedge_vault_address": "CBVVGJTBOILYBA3CSPYHNNHIZTGQPJGAQZ7PQRTZ3SLQEHC6FKGKQ5U2",
      "risk_vault_address": "CB6XUGEEFJWEN7OYQGW6UNCFEJLUVOL3IR5YARO3E2UDKRZUB7WMENCZ",
      "commission_fee": 0,
      "risk_score": 0,
      "is_automatic": true,
      "event_unix_timestamp": 1746057600,
      "lock_period_in_seconds": 0,
      "event_threshold_in_seconds": 0,
      "unlock_period_in_seconds": 0
    }'

Thu May 01 2025 00:00:00 GMT+0000

```
