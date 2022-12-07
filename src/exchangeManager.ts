import { Provider } from '@ethersproject/providers';
import {
  IBroker,
  IBroker__factory,
  IExchangeProvider,
  IExchangeProvider__factory,
} from '@mentolabs/core';

export class ExchangeManager {
  private broker: IBroker;
  private provider: Provider;

  constructor(provider: Provider) {
    this.provider = provider;

    this.broker = IBroker__factory.connect(
      '0x23a4D848b3976579d7371AFAF18b989D4ae0b031',
      provider
    );
  }

  async getAllExchanges(): Promise<IExchangeProvider.ExchangeStructOutput[]> {
    let mentoExchanges: IExchangeProvider.ExchangeStructOutput[] = [];

    const exchangeProviders = await this.broker.getExchangeProviders();

    if (exchangeProviders.length == 0) {
      return mentoExchanges;
    }

    for (let index = 0; index < exchangeProviders.length; index++) {
      const exchangeProvider: IExchangeProvider =
        IExchangeProvider__factory.connect(
          exchangeProviders[index],
          this.provider
        );

      const exchanges = await exchangeProvider.getExchanges();
      mentoExchanges = mentoExchanges.concat(exchanges);
    }

    return mentoExchanges;
  }

  async getAllAssets(): Promise<Set<string>> {
    let mentoAssets: Set<string> = new Set<string>();

    const mentoExchanges = await this.getAllExchanges();

    for (let index = 0; index < mentoExchanges.length; index++) {
      mentoExchanges[index].assets.forEach((asset) => mentoAssets.add(asset));
    }

    return mentoAssets;
  }

  async getTradeableAssets(inputAsset: string): Promise<string[]> {
    const tradeableAssets: Set<string> = new Set<string>();

    const exchanges = await this.getAllExchanges();
    for (let index = 0; index < exchanges.length; index++) {
      const exchange = exchanges[index];

      if (exchange.assets.includes(inputAsset)) {
        exchange.assets
          .filter((asset) => asset !== inputAsset)
          .forEach((asset) => tradeableAssets.add(asset));
      }
    }

    return Array.from(tradeableAssets);
  }
}
