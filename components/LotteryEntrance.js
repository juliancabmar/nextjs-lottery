import { useEffect, useState } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

import { contractAddresses, abi } from "../constants/index"

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("")
    const [recentWinner, setRecentWinner] = useState("")
    const dispatch = useNotification()

    const chainId = Number(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    console.log("INFO: ", chainId, raffleAddress)

    const {
        runContractFunction: enterRaffle,
        data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
        msgValue: "",
    })

    const { runContractFunction: getNumPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
        msgValue: "",
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
        msgValue: "",
    })

    async function updateUI() {
        const entranceFeeFromCall = await getEntranceFee()
        const numPlayersFromCall = await getNumPlayers()
        const recentWinnerFromCall = await getRecentWinner()

        setEntranceFee(entranceFeeFromCall.toString())
        setNumPlayers(numPlayersFromCall.toString())
        setRecentWinner(recentWinnerFromCall.toString())
    }

    const handleNewNotification = function (tx) {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "topR",
            icon: "bell",
        })
        console.log("hadle executed")
    }

    const handleSuccess = async function (tx) {
        try {
            await tx.wait(1)
            handleNewNotification(tx)
            await updateUI()
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    return (
        <div className="p-5">
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isFetching || isLoading ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>
                    <div>
                        <div>
                            Hi!... this is the lottery entrance fee:
                            {ethers.utils.formatUnits(entranceFee, "ether")} ETH
                        </div>
                        <div>Number of players: {numPlayers}</div>
                        <div>Recent winner: {recentWinner}</div>
                    </div>
                </div>
            ) : (
                <div>No raffle detected</div>
            )}
        </div>
    )
}
