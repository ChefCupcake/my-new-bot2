import BigNumber from 'bignumber.js'
import {
    BlockEvent,
    Finding,
    HandleBlock,
    FindingSeverity,
    FindingType,
    getEthersProvider,
    ethers
} from 'forta-agent'

export const ACCOUNT = "0x1a5238878B2c138B9DCCe2ea6BE9CF7e9F12Cf6a"
export const MIN_BALANCE = "50000000000000000" // 0.05 BNB
export const RPC_URL = "https://goerli.infura.io/v3/cb868cd8386c44bb9f7ff01883457af7"

let currentBlockNumber = -1;

const rpcProvider = new ethers.providers.JsonRpcProvider(RPC_URL)

async function initialize() {
    currentBlockNumber = await rpcProvider.getBlockNumber()
}

async function handleBlock(blockEvent: BlockEvent) {
    // report finding if specified account balance falls below threshold
    const findings: Finding[] = []

    const latestBlockNumber = await rpcProvider.getBlockNumber()


    const accountBalance = new BigNumber((await rpcProvider.getBalance(ACCOUNT, blockEvent.blockNumber)).toString())
    if (accountBalance.isGreaterThanOrEqualTo(MIN_BALANCE)) return findings

    findings.push(
        Finding.fromObject({
                name: "Minimum Account Balance",
                description: `Account balance (${accountBalance.toString()}) below threshold (${MIN_BALANCE})`,
                alertId: "PANCAKE-1",
                severity: FindingSeverity.Info,
                type: FindingType.Suspicious,
                metadata: {
                    balance: accountBalance.toString()
                }
            }
        ))

    return findings
}


export default {
    initialize,
    handleBlock,
}