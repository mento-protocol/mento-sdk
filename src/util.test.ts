import { Contract, Wallet, constants, providers, utils } from "ethers";
import { getBrokerAddressFromRegistry, getSymbolFromTokenAddress, increaseAllowance } from "./utils";

jest.mock("ethers", () => {
  return {
    constants: jest.requireActual("ethers").constants,
    providers: jest.requireActual("ethers").providers,
    Signer: jest.requireActual("ethers").Signer,
    utils: jest.requireActual("ethers").utils,
    Wallet: jest.requireActual("ethers").Wallet,
    Contract: jest.fn(),
  };
});

const getAddressForString = jest.fn();
const symbol = jest.fn();
const increaseAllowanceFn = jest.fn();

// @ts-ignore
Contract.mockImplementation(() => ({
  getAddressForString,
  populateTransaction: {
    increaseAllowance: increaseAllowanceFn,
  },
  symbol,
}));

let provider: providers.JsonRpcProvider;
let signer: Wallet;

describe("Utils", () => {
  beforeAll(() => {
    provider = new providers.JsonRpcProvider();
    signer = new Wallet(Wallet.createRandom().privateKey, provider);
  });

  describe("getBrokerAddressFromRegistry", () => {
    it("should return the broker address from the registry", async () => {
      const expectedBrokerAddr = "0xFakeBrokerAddress";
      getAddressForString.mockReturnValueOnce(expectedBrokerAddr);

      expect(await getBrokerAddressFromRegistry(provider)).toBe(expectedBrokerAddr);
      expect(getAddressForString).toHaveBeenCalledTimes(1);
      expect(getAddressForString).toHaveBeenCalledWith("Broker");
    });

    it("should throw when the registry returns the null address 0x...00", async () => {
      getAddressForString.mockReturnValueOnce(constants.AddressZero);

      expect(async () => {
        await getBrokerAddressFromRegistry(provider);
      }).rejects.toThrow();
    });
  });

  describe("getSymbolFromTokenAddress", () => {
    it("should return the symbol of the erc20 contract address", async () => {
      const fakecUsdAddress = "0xcUSDAddress";
      symbol.mockReturnValueOnce("fakeSymbol");

      expect(await getSymbolFromTokenAddress(fakecUsdAddress, provider)).toBe("fakeSymbol");
      expect(symbol).toHaveBeenCalledTimes(1);
    });
  });

  describe("increaseAllowance", () => {
    it("should return a populated increaseAllowance tx object", async () => {
      const fakePopulatedTxObj = {
        from: "0x123",
        data: "0x789",
      };
      increaseAllowanceFn.mockReturnValueOnce(fakePopulatedTxObj);

      const ten = utils.parseUnits("10", 18);
      const tx = await increaseAllowance("fakeTokenAddr", "fakeSpender", ten, signer);
      expect(increaseAllowanceFn).toHaveBeenCalledTimes(1);
      expect(increaseAllowanceFn).toHaveBeenCalledWith("fakeSpender", ten);
      expect(tx).toEqual(fakePopulatedTxObj);
    });
  });
});
