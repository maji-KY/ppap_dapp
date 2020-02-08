use eosio::*;
use eosio_cdt::*;

#[eosio::table("playercard")]
struct PlayerCard {
    #[eosio(primary_key)]
    player: eosio::AccountName,
    #[eosio(secondary_key)]
    master: eosio::AccountName,
    player_name: String,
    card: u64,
}

#[eosio::action]
fn join(player: eosio::AccountName, master: eosio::AccountName, player_name: String) {
    eosio_cdt::require_auth(player);

    let code = eosio_cdt::current_receiver();
    let table = PlayerCard::table(code, master);

    let card = table.find(player);
    assert!(card.is_none(), "already joined!");

    let card = PlayerCard {
        player,
        master,
        player_name,
        card: 0,
    };

    table.emplace(player, card).expect("join error");

    eosio_cdt::print!("join ", player, " to ", master);
}

#[eosio::action]
fn leave(player: eosio::AccountName, master: eosio::AccountName) {
    let code = eosio_cdt::current_receiver();
    let table = PlayerCard::table(code, master);
    let cursor = table.find(player).expect("record not found!");

    cursor.erase().expect("leave error");

    eosio_cdt::print!("leave ", player, " from ", master);
}

#[eosio::action]
fn bet(player: eosio::AccountName, master: eosio::AccountName, card: u64) {
    eosio_cdt::require_auth(player);

    let code = eosio_cdt::current_receiver();
    let table = PlayerCard::table(code, master);
    let cursor = table.find(player).expect("record not found!");

    let mut player_card = cursor.get().expect("read error");
    player_card.card = card;

    cursor.modify(Payer::Same, player_card).expect("write error");

    eosio_cdt::print!("player ", player, " bet ", card);
}

eosio_cdt::abi!(join, leave, bet);
