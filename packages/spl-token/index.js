import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
} from "@solana/spl-token";

(async () => {
  // Step 1: Connect to cluster and generate a new Keypair
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Insert secret key of your wallet here for the mint account; NEVER UPLOAD
  const fromWallet = Keypair.fromSecretKey(
    Uint8Array.from(`PUT HERE THE SECRET KEY`)
  );
  const toWallet = new PublicKey(
    "6cut9fD3qTbDRFara7sZo7tnBGi6y3unmZKSt96VhcDU"
  );

  console.log("Setting fromWallet to: ", fromWallet.publicKey.toString());
  console.log("Setting toWallet to: ", toWallet.toString());

  // Step 2: Airdrop SOL into your from wallet
  const fromAirdropSignature = await connection.requestAirdrop(
    fromWallet.publicKey,
    LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(fromAirdropSignature, {
    commitment: "confirmed",
  });
  console.log("Airdrop 2 SOL to fromWallet successful!");

  // Step 3: Create new token mint and get the token account of the fromWallet address
  //If the token account does not exist, create it
  const tokenMintAccount = await createMint(
    connection,
    fromWallet,
    fromWallet.publicKey,
    null,
    9
  );
  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    fromWallet,
    tokenMintAccount,
    fromWallet.publicKey
  );
  console.log("Newly minted token: ", tokenMintAccount.toBase58());

  //Step 4: Mint a new token to the from account
  const oneHundred = 100000000000;
  let signature = await mintTo(
    connection,
    fromWallet,
    tokenMintAccount,
    fromTokenAccount.address,
    fromWallet.publicKey,
    oneHundred,
    []
  );
  console.log("Mint tx: ", signature);

  //Step 5: Get the token account of the to-wallet address and if it does not exist, create it
  const toTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    fromWallet,
    tokenMintAccount,
    toWallet
  );

  //Step 6: Transfer the new token to the to-wallet's token account that was just created
  // Transfer the new token to the "toTokenAccount" we just created
  signature = await transfer(
    connection,
    fromWallet,
    fromTokenAccount.address,
    toTokenAccount.address,
    fromWallet.publicKey,
    oneHundred,
    []
  );
  console.log("Transfer tx: ", signature);
})();
