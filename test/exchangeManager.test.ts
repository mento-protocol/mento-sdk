import { JsonRpcProvider } from '@ethersproject/providers';
import { ExchangeManager } from '../src/exchangeManager';

let testee: ExchangeManager;

describe('ExchangeManager:', () => {
  beforeAll(async () => {
    testee = new ExchangeManager(
      new JsonRpcProvider('https://baklava-forno.celo-testnet.org')
    );
  });

  it('Should get all tradeable assets', async () => {
    const assets = await testee.getAllAssets();
    console.log(assets);
  });
});
