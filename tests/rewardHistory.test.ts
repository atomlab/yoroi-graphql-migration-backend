import axios from "axios";
import { expect } from "chai";
import { config, } from "./config";

const endpoint = config.apiUrl;
const testableUri = endpoint + "getRewardHistory";

const realAddr = "e1ac482f1aca71a41bf8a4f36cd8b2e4e926a2d7a3ed7704b40fedc2f0";
const fakeAddr = "0000000000000000000000000000000000000000000000000000000001";

describe("/getRewardHistory", function() {
  it("should return information about a pool that has metadata available", async() => {
    const result = await axios({method: "post", url: testableUri, data: {addresses: [realAddr, fakeAddr]}});
    expect(result.data).to.have.property(realAddr);
    expect(result.data).to.have.property(fakeAddr);
    
    for(const rewardTuple of result.data[realAddr]){
        expect(rewardTuple).to.have.property("amount");
        expect(rewardTuple).to.have.property("epoch");
    }

    expect(result.data[fakeAddr]).to.be.empty;
  });
});
