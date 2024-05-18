import { useState } from "react";
import * as web3 from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";
import * as token from "@solana/spl-token";
import Accounts from "./Accounts";

const Starter = () => {
  // Token Mint
  const [mintTx, setMintTx] = useState<string>("");
  const [mintAddr, setMintAddr] = useState<web3.PublicKey | undefined>(
    undefined
  );
  const [accTx, setAccTx] = useState<string>("");
  const [accAddr, setAccAddr] = useState<web3.PublicKey | undefined>(undefined);

  // wallet variables

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const isWalletConnected = () => {
    if (!connection || !publicKey) {
      toast.error("Please connect your wallet.");
      return true;
    } else {
      throw Error("Wallet is not connected");
      return false;
    }
  };

  // creating a transaction to create a token mint on the block chain
  const createMint = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (!isWalletConnected) {
      return;
    }
    try {
      const tokenMint = web3.Keypair.generate();
      const lamports = await token.getMinimumBalanceForRentExemptMint(
        connection
      );
      const transaction = new web3.Transaction().add(
        // creates a new account
        web3.SystemProgram.createAccount({
          fromPubkey: publicKey!,
          newAccountPubkey: tokenMint.publicKey,
          lamports: lamports,
          space: token.MINT_SIZE,
          programId: token.TOKEN_PROGRAM_ID,
        }),
        // Initializes the new account as a Token mint account
        token.createInitializeMintInstruction(
          tokenMint.publicKey,
          0,
          publicKey!,
          token.TOKEN_PROGRAM_ID
        )
      );

      const signature = await sendTransaction(transaction, connection, {
        signers: [tokenMint],
      });
      setMintTx(signature);
      console.log(mintAddr);
      setMintAddr(tokenMint.publicKey);
      console.log(mintAddr);
    } catch (error) {
      toast.error("Error creaing token mint!!");
      console.log("error", error);
    }
  };

  // create transaction to create a token accout for the mint we created on the blockchain

  const createAccount = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (!isWalletConnected) {
      return;
    }

    try {
      const tokenAccount = web3.Keypair.generate();
      const space = token.ACCOUNT_SIZE;
      const lamports = await connection.getMinimumBalanceForRentExemption(
        space
      );
      const programId = token.TOKEN_PROGRAM_ID;
      const transaction = new web3.Transaction().add(
        // create a token account
        web3.SystemProgram.createAccount({
          fromPubkey: publicKey!,
          newAccountPubkey: tokenAccount.publicKey,
          space,
          lamports,
          programId,
        }),
        // Initialize the new Account as a token account
        token.createInitializeAccountInstruction(
          tokenAccount.publicKey,
          mintAddr!,
          publicKey!,
          token.TOKEN_PROGRAM_ID
        )
      );
      const signature = await sendTransaction(transaction, connection, {
        signers: [tokenAccount],
      });
      setAccTx(signature);
      setAccAddr(tokenAccount.publicKey);
    } catch (error) {
      toast.error("Error creating token Account");
      console.log("error", error);
    }
  };

  const createAccountsOutputs = [
    {
      title: "Token Account Address...",
      dependency: accAddr!,
      href: `https://explorer.solana.com/address/${accAddr}?cluster=devnet`,
    },
    {
      title: "Transaction Signature...",
      dependency: accTx!,
      href: `https://explorer.solana.com/tx/${accTx}?cluster=devnet`,
    },
  ];

  const crateMintOutputs = [
    {
      title: "Token Mint Address...",
      depenedency: mintAddr!,
      href: `https://explorer.solana.com/address/${mintAddr}?cluster=devnet`,
    },
    {
      title: "Transaction Signature...",
      dependency: mintTx!,
      href: `https://explorer.solana.com/tx/${mintTx}?cluster=devnet`,
    },
  ];

  return (
    <main className="max-w-7xl grid grid-cols-1 sm:grid-cols-6 gap-4 p-4 text-white">
      <Accounts heading = {'Create Mint 🦄'} createMint={createMint} crateMintOutputs={crateMintOutputs}/>
      <Accounts heading = {'Create Account ✨'} createMint={createAccount} crateMintOutputs={createAccountsOutputs}/>
    </main>
  );
};

export default Starter;
