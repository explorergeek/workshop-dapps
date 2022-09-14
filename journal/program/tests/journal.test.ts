import {
    Connection,
    PublicKey,
    sendAndConfirmTransaction,
    Transaction,
} from '@solana/web3.js';
import {
    createInitializeJournalInstruction,
    createKeypairFromFile,
    createNewEntryInstruction,
    JournalEntry,
    JournalMetadata,
} from '../ts';


describe("Journal dApp!", async () => {

    const connection = new Connection(`http://localhost:8899`, 'confirmed');
    const payer = createKeypairFromFile(require('os').homedir() + '/.config/solana/id.json');
    const program = createKeypairFromFile('./program/target/so/journal-keypair.json');

    it("Initialize the Journal", async () => {
        const [ix, journalAddress] = createInitializeJournalInstruction(
            payer.publicKey, program.publicKey
        );
        await sendAndConfirmTransaction(
            connection, 
            new Transaction().add(ix),
            [payer]
        );
        await printJournal(journalAddress);
    });
    
    it("Write a new entry (1/3)", async () => {
        const [ix, entryAddress] = await createNewEntryInstruction(
            connection, payer.publicKey, program.publicKey,
            "Just got back from the Solana Hacker House"
        );
        await sendAndConfirmTransaction(
            connection, 
            new Transaction().add(ix),
            [payer]
        );
        await printJournalEntry(entryAddress);
    });

    it("Write a new entry (2/3)", async () => {
        const [ix, entryAddress] = await createNewEntryInstruction(
            connection, payer.publicKey, program.publicKey,
            "Just built my first Solana program"
        );
        await sendAndConfirmTransaction(
            connection, 
            new Transaction().add(ix),
            [payer]
        );
        await printJournalEntry(entryAddress);
    });
    
    it("Write a new entry (3/3)", async () => {
        const [ix, entryAddress] = await createNewEntryInstruction(
            connection, payer.publicKey, program.publicKey, 
            "I got a job at a Solana protocol!"
        );
        await sendAndConfirmTransaction(
            connection, 
            new Transaction().add(ix),
            [payer]
        );
        await printJournalEntry(entryAddress);
    });

    async function printJournal(pubkey: PublicKey): Promise<void> {
        const journalData = JournalMetadata.fromBuffer(
            (await connection.getAccountInfo(pubkey)).data
        );
        console.log("Journal:");
        console.log(`   Nickname:       ${journalData.nickname}`);
    }

    async function printJournalEntry(pubkey: PublicKey): Promise<void> {
        const journalEntryData = JournalEntry.fromBuffer(
            (await connection.getAccountInfo(pubkey)).data
        );
        console.log("Journal Entry:");
        console.log(`   Entry #:       ${journalEntryData.entryCount}`);
        console.log(`   Message:       ${journalEntryData.message}`);
    }
  });
  