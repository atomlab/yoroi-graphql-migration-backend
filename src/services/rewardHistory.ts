import config from "config";
import axios from "axios";
import { Pool } from "pg";
import { Request, Response } from "express";

import { Dictionary } from "../utils"

const addressesRequestLimit:number = config.get("server.addressRequestLimit");

interface RewardTple {
    epoch: number;
    amount: number;
}


const rewardAddrQuery = `
  select encode(stake_address.hash, 'hex') as addr
       , reserve.amount
       , block.epoch_no 
  from reserve 
  join stake_address 
    on reserve.addr_id = stake_address.id 
  join tx 
    on reserve.tx_id = tx.id 
  join block on tx.block = block.id
  where encode(stake_address.hash,'hex') = any(($1)::varchar array)
`;

export const handleRewardHistory = (p: Pool) => async (req: Request, res: Response):Promise<void>=> { 
  if(!req.body.addresses || req.body.addresses.length === 0 )
    throw new Error ("No addresses in body");
  const hashes = req.body.addresses;

  if(!(hashes instanceof Array) || hashes.length > addressesRequestLimit)
    throw new Error (` addresses must have between 0 and ${addressesRequestLimit} items`);
   
  const rewardResults = await p.query(rewardAddrQuery, [hashes]);

  const ret:Dictionary<any> = {};

  for (const hash of hashes) {

    ret[hash] = rewardResults.rows.filter( (row: any) => row.addr === hash)
                                  .map( (row: any) => ({ epoch: row.epoch_no
                                                       , amount: row.amount })); 
  }

  res.send(ret);
  return; 

};

