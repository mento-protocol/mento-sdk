export const ETHERS_ERROR_CODE_ESTIMATEGAS = 'UNPREDICTABLE_GAS_LIMIT'
export const ETHERS_ERROR_METHOD_ESTIMATEGAS = 'estimateGas'
export const DEFAULT_SIMULATE_ERROR_MESSAGE = 'An unknown error occurred'

export const knownErrorsMapping: { [key: string]: string } = {
  'ExchangeProvider does not exist':
    'The exchange provider specified does not exist',
}
