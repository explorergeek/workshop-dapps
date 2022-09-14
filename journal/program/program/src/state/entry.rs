use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::pubkey::Pubkey;


// The struct representing the entry account's data
// We'll create a new one of these with every entry
//
#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct JournalEntry {
    pub entry_number: u32,
    pub message: String,
    pub journal: Pubkey,
    pub bump: u8,
}

impl JournalEntry {

    pub const ACCOUNT_SPACE: usize = 8 + 4 + 40 + 32;
    pub const SEED_PREFIX: &'static str = "entry";

    pub fn new(
        entry_number: u32,
        message: String,
        journal: Pubkey,
        bump: u8,
    ) -> Self {
        JournalEntry {
            entry_number,
            message,
            journal,
            bump,
        }
    }
}