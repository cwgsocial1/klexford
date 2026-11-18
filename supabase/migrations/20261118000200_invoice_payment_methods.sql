begin;

alter table public.payment_settings
  add column bank_currency text not null default '' check (bank_currency = '' or bank_currency ~ '^[A-Z]{3}$'),
  add column bank_instructions text not null default '' check (char_length(bank_instructions) <= 1000),
  add column crypto_coin text not null default '' check (char_length(crypto_coin) <= 60),
  add column crypto_network text not null default '' check (char_length(crypto_network) <= 100),
  add column crypto_address text not null default '' check (char_length(crypto_address) <= 512),
  add column crypto_instructions text not null default '' check (char_length(crypto_instructions) <= 1000),
  add constraint crypto_payment_details_complete check (
    (crypto_coin = '' and crypto_network = '' and crypto_address = '' and crypto_instructions = '')
    or (crypto_coin ~ '[^[:space:]]' and crypto_network ~ '[^[:space:]]' and crypto_address ~ '[^[:space:]]')
  );

-- Existing admin-only row policies continue to govern these column privileges.
grant update (bank_currency, bank_instructions, crypto_coin, crypto_network, crypto_address, crypto_instructions)
  on public.payment_settings to authenticated;

create or replace function public.get_shared_invoice(token uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'invoice', to_jsonb(i) - array['owner_id','share_token'],
    'settings', jsonb_build_object(
      'bank_name', s.bank_name,
      'account_name', s.account_name,
      'account_number', s.account_number,
      'bank_currency', s.bank_currency,
      'bank_instructions', s.bank_instructions,
      'crypto_coin', s.crypto_coin,
      'crypto_network', s.crypto_network,
      'crypto_address', s.crypto_address,
      'crypto_instructions', s.crypto_instructions,
      'payment_url', s.payment_url
    )
  )
  from public.invoices i cross join public.payment_settings s
  where i.share_token = token and i.status in ('sent','paid','overdue') and s.id = 1;
$$;

commit;
