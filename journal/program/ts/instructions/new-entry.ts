import { Assignable } from '../util/util';
import * as borsh from "borsh";
import { Buffer } from "buffer";
import { 
    Connection, 
    PublicKey, 
    SystemProgram,
    TransactionInstruction 
} from '@solana/web3.js';
import { JournalEntry, JournalMetadata } from '../state';


export class NewEntry extends Assignable {
    toBuffer() { 
        return Buffer.from(borsh.serialize(NewEntrySchema, this)) 
    };
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(NewEntrySchema, NewEntry, buffer);
    };
};

export const NewEntrySchema = new Map([
    [ NewEntry, { 
        kind: 'struct', 
        fields: [ 
            ['message', 'string'],
            ['bump', 'u8'],
        ],
    }]
]);

export async function createNewEntryInstruction(
    connection: Connection,
    payer: PublicKey,
    programId: PublicKey,
    message: string,
): Promise<[TransactionInstruction, PublicKey]> {

    const [journalAddress, _journalBump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("journal"),
            payer.toBuffer(),
        ],
        programId
    );
    const journalData = JournalMetadata.fromBuffer(
        (await connection.getAccountInfo(journalAddress)).data
    );
    
    const [entryAddress, entryBump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("entry"),
            Buffer.from((journalData.entries + 1).toString()),
            journalAddress.toBuffer(),
        ],
        programId
    );

    const newEntryInstructionObject = new NewEntry({
        message: message,
        bump: entryBump,
    });

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: entryAddress, isSigner: false, isWritable: true},
            {pubkey: journalAddress, isSigner: false, isWritable: true},
            {pubkey: payer, isSigner: true, isWritable: true},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false}
        ],
        programId: programId,
        data: newEntryInstructionObject.toBuffer(),
    }); 

    return [ix, entryAddress];
}