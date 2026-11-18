import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import { PGlite } from '@electric-sql/pglite';

// A fresh PostgreSQL instance runs the actual migrations and policies. These
// fixtures supply only the Supabase-managed relations and request identity.
const infrastructure = `
  create role anon;
  create role authenticated;
  create role service_role bypassrls;
  create schema auth;
  create schema storage;
  grant usage on schema auth,storage to anon,authenticated,service_role;
  alter default privileges in schema public grant all on tables to anon,authenticated,service_role;
  alter default privileges in schema public grant all on functions to anon,authenticated,service_role;
  create function auth.uid() returns uuid stable language sql as $$
    select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
  $$;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text, unique(bucket_id,name));
  alter table storage.objects enable row level security;
  grant select,insert,update,delete on storage.objects to anon,authenticated;
`;
const migrations = new URL('../migrations/', import.meta.url);
const uuid = n => '10000000-0000-4000-8000-' + String(n).padStart(12, '0');
const admin = uuid(1), alice = uuid(2), bob = uuid(3);
const cover = alice + '/cover.webp', replacement = alice + '/replacement.png';
const work = uuid(101), quote = uuid(102), invoice = uuid(201);
const grants = ['work.manage', 'testimonials.manage', 'invoices.manage', 'inquiries.manage'];
const legacyBank = {
  bank_name: 'Existing bank', account_name: 'Existing account', account_number: '00012345',
  payment_url: 'https://payments.example.test/invoice',
};
const paymentMethods = {
  bank_currency: 'GBP', bank_instructions: 'Include the invoice reference.',
  crypto_coin: 'USDC', crypto_network: 'Polygon', crypto_address: 'test-wallet',
  crypto_instructions: 'Use the listed network.',
};
const newObject = "insert into storage.objects(bucket_id,name) values ('portfolio-media',$1)";
const intake = "select record_inquiry($1,'project','Client','client@example.test',$2,'test-source')";
const insertUser = 'insert into auth.users values($1,$2,$3)';

test('workspace database authorization', async t => {
  const db = new PGlite();
  t.after(() => db.close());
  const rows = async (sql, args = []) => (await db.query(sql, args)).rows;
  const count = async (sql, args) => (await rows(sql, args)).length;
  const value = async (sql, args) => Object.values((await rows(sql, args))[0])[0];
  const denied = (sql, args, code = '42501') => assert.rejects(() => rows(sql, args), error => error.code === code);
  const as = async (role, id = '') => {
    await db.exec('reset role');
    await rows("select set_config('request.jwt.claim.sub',$1,false)", [id]);
    await db.exec('set role ' + role);
  };

  await db.exec(infrastructure);
  await rows(insertUser, [admin, 'admin@example.test', { role: 'admin' }]);
  const [initial, ...upgrades] = (await readdir(migrations)).filter(file => file.endsWith('.sql')).sort();
  await db.exec(await readFile(new URL(initial, migrations), 'utf8'));
  // Upgrade a previously configured agency without guessing its bank currency.
  await rows('update payment_settings set bank_name=$1, account_name=$2, account_number=$3, payment_url=$4 where id=1',
    [legacyBank.bank_name, legacyBank.account_name, legacyBank.account_number, legacyBank.payment_url]);
  for (const file of upgrades) {
    await db.exec(await readFile(new URL(file, migrations), 'utf8'));
  }

  await t.test('provisions inactive experts and restricts all profile mutations to administrators', async () => {
    for (const [id, name] of [[alice, 'Alice'], [bob, 'Bob']]) {
      await rows(insertUser, [id, name.toLowerCase() + '@example.test', { display_name: name, role: 'admin', permissions: ['work.publish'] }]);
    }
    assert.equal(await value("select count(*) from profiles where role='expert' and not active and permissions='{}'"), 3);
    await rows("update profiles set role='admin', active=true where id=$1", [admin]);
    await rows("update auth.users set email='other@example.test' where id=$1", [alice]);
    assert.equal(await value('select email from profiles where id=$1', [alice]), 'other@example.test');

    await as('authenticated', admin);
    assert.equal(await count('update profiles set active=true,permissions=$1 where id<>$2 returning id', [grants, admin]), 2);
    assert.equal(await count('update profiles set active=false where id=$1 returning id', [admin]), 0);
    await denied("update profiles set role='admin' where id=$1", [alice]);
    await denied('delete from profiles where id=$1', [admin]);

    await as('authenticated', alice);
    assert.equal(await count('select id from profiles'), 1);
    assert.equal(await count("update profiles set permissions=array['work.publish'] returning id"), 0);
    await denied('truncate table public.portfolio_work');
    await denied('truncate table public.testimonials');
    await denied('delete from auth.users where id=$1', [alice]);
  });

  await t.test('isolates drafts and enforces separate publication and media permissions', async () => {
    await rows(newObject, [cover]);
    await denied(newObject, [bob + '/cover.png']);
    await rows("insert into portfolio_work(id,title,summary,image_path) values ($1,'Work','Summary',$2)", [work, cover]);
    await rows("insert into testimonials(id,client_name,quote) values ($1,'Client','Quote')", [quote]);
    await denied("insert into portfolio_work(author_id,title,summary) values ($1,'Work','Summary')", [bob]);
    await denied("insert into portfolio_work(title,summary,image_path) values ('Work','Summary',$1)", [alice + '/missing.webp'], '23514');
    assert.equal(await count('delete from storage.objects where name=$1 returning id', [cover]), 0);
    assert.equal(await count("update storage.objects set name='other.png' returning id"), 0);
    await denied("update portfolio_work set status='published' where id=$1", [work]);
    await denied("update testimonials set status='published' where id=$1", [quote]);

    for (const [role, id] of [['anon', ''], ['authenticated', bob]]) {
      await as(role, id);
      assert.equal(await count('select id from portfolio_work'), 0);
      assert.equal(await count('select id from testimonials'), 0);
      assert.equal(await count('select id from storage.objects'), 0);
    }
    await as('authenticated', admin);
    await rows('update profiles set permissions=$1 where id=$2', [[...grants, 'work.publish', 'testimonials.publish'], alice]);
    await as('authenticated', alice);
    assert.equal(await count("update portfolio_work set status='published' returning id"), 1);
    assert.equal(await count("update testimonials set status='published' returning id"), 1);
    await as('anon');
    assert.equal(await count('select id from portfolio_work'), 1);
    assert.equal(await count('select id from testimonials'), 1);
    assert.equal(await count('select id from storage.objects'), 1);
    await denied('select * from profiles');

    await as('authenticated', admin);
    await rows('update profiles set permissions=$1 where id=$2', [grants, alice]);
    for (const user of [alice, bob]) {
      await as('authenticated', user);
      assert.equal(await count("update portfolio_work set status='draft' returning id"), 0);
      assert.equal(await count("update testimonials set quote='changed' returning id"), 0);
      assert.equal(await count('delete from testimonials returning id'), 0);
      assert.equal(await count('delete from storage.objects returning id'), 0);
    }

    await as('authenticated', admin);
    await rows(newObject, [replacement]);
    assert.equal(await count("update portfolio_work set status='draft',image_path=$1 where id=$2 returning id", [replacement, work]), 1);
    assert.equal(await count('delete from storage.objects where name=$1 returning id', [cover]), 1);
    assert.equal(await count('delete from storage.objects where name=$1 returning id', [replacement]), 0);
    await as('anon');
    assert.equal(await count('select id from storage.objects'), 0);
    await as('authenticated', bob);
    assert.equal(await count('select id from storage.objects'), 0);
    await as('authenticated', alice);
    assert.equal(await count('delete from portfolio_work where id=$1 returning id', [work]), 1);
    assert.equal(await count('delete from storage.objects where name=$1 returning id', [replacement]), 1);
  });

  await t.test('restricts billing, payment settings and issued invoice links', async () => {
    await as('authenticated', admin);
    assert.deepEqual(await rows('select bank_name,account_name,account_number,payment_url,bank_currency,crypto_coin from payment_settings'),
      [{ ...legacyBank, bank_currency: '', crypto_coin: '' }]);
    await denied("update payment_settings set bank_currency='dollars'", [], '23514');
    await denied("update payment_settings set crypto_coin='USDC' where id=1", [], '23514');
    const paymentEdit = 'update payment_settings set bank_currency=$1,bank_instructions=$2,crypto_coin=$3,crypto_network=$4,crypto_address=$5,crypto_instructions=$6 where id=1 returning id';
    const paymentValues = [paymentMethods.bank_currency, paymentMethods.bank_instructions, paymentMethods.crypto_coin,
      paymentMethods.crypto_network, paymentMethods.crypto_address, paymentMethods.crypto_instructions];
    assert.equal(await count(paymentEdit, paymentValues), 1);
    await rows("update site_settings set agency_name='Team' where id=true");
    await as('authenticated', alice);
    assert.equal(await count('select * from payment_settings'), 0);
    assert.equal(await count(paymentEdit, paymentValues), 0);
    assert.equal(await count("update site_settings set agency_name='Other' returning id"), 0);
    const items = JSON.stringify([{ description: 'Work', qty: 1, rate: 10 }]);
    const [receipt] = await rows(`
      insert into invoices(id,client_name,client_email,items,due_date)
      values ($1,'Client','client@example.test',$2,current_date+2) returning number,owner_name,share_token
    `, [invoice, items]);
    assert.equal(receipt.owner_name, 'Alice');
    await as('anon');
    assert.equal(await value('select get_shared_invoice($1)', [receipt.share_token]), null);
    await denied('select crypto_address from payment_settings');
    await denied('select * from invoices');
    await as('authenticated', bob);
    assert.equal(await count('select id from invoices'), 0);
    assert.equal(await count('select * from get_invoice_balances()'), 0);
    await as('authenticated', alice);
    await denied("update invoices set status='paid' where id=$1", [invoice]);
    await rows("update invoices set status='sent' where id=$1", [invoice]);
    assert.equal(await count('delete from invoices returning id'), 0);
    const balances = () => rows('select * from get_invoice_balances()');
    assert.deepEqual(await balances(), [{ currency: 'USD', paid: '0', outstanding: '10.00', overdue: '0' }]);
    await rows("update invoices set issue_date=current_date-3,due_date=current_date-1,tax_rate=5,discount=2 where id=$1", [invoice]);
    assert.deepEqual(await balances(), [{ currency: 'USD', paid: '0', outstanding: '0', overdue: '8.40' }]);
    await as('anon');
    await denied('select * from get_invoice_balances()');
    assert.equal(await value('select get_shared_invoice($1)', [invoice]), null);
    const shared = await value('select get_shared_invoice($1)', [receipt.share_token]);
    assert.equal(shared.invoice.number, receipt.number);
    assert.equal(shared.invoice.share_token, undefined);
    assert.deepEqual(shared.settings, { ...legacyBank, ...paymentMethods });
    await as('authenticated', admin);
    await rows("update invoices set status='cancelled' where id=$1", [invoice]);
    await as('anon');
    assert.equal(await value('select get_shared_invoice($1)', [receipt.share_token]), null);
    await as('authenticated', admin);
    await rows("update invoices set status='sent' where id=$1", [invoice]);
    await rows("update payment_settings set crypto_coin='',crypto_network='',crypto_address='',crypto_instructions='' where id=1");
    const cleared = await value('select get_shared_invoice($1)', [receipt.share_token]);
    assert.equal(cleared.settings.crypto_address, '');
    assert.equal(cleared.invoice.currency, 'USD');
    assert.equal(cleared.settings.bank_currency, 'GBP');
    assert.ok(await value("update invoices set status='paid' where id=$1 returning paid_at", [invoice]));
    assert.deepEqual(await balances(), [{ currency: 'USD', paid: '8.40', outstanding: '0', overdue: '0' }]);
    assert.equal(await count("update invoices set status='sent' returning id"), 0);
    assert.equal(await count('delete from invoices returning id'), 0);
  });

  await t.test('limits public intake to the service role, handles retries and respects immediate revocation', async () => {
    const request = [uuid(401), '{"message":"hello"}'];
    await as('anon');
    await denied(intake, request);
    await as('authenticated', alice);
    await denied(intake, request);
    await as('service_role');
    assert.equal(await value(intake, request), 'created');
    assert.equal(await value(intake, request), 'duplicate');
    assert.equal(await value(intake, [uuid(401), '{}']), 'conflict');
    for (let i = 1; i < 12; i++) {
      assert.equal(await value(intake, [uuid(401 + i), '{}']), 'created');
    }
    assert.equal(await value(intake, [uuid(450), '{}']), 'limited');
    await as('authenticated', alice);
    assert.equal(await count("update inquiries set status='contacted' where id=$1 returning id", [uuid(401)]), 1);
    await as('authenticated', admin);
    await rows('update profiles set active=false where id=$1', [alice]);
    await as('authenticated', alice);
    assert.equal(await count('select id from inquiries'), 0);
    assert.equal(await count('select id from invoices'), 0);
    await denied("insert into testimonials(quote,client_name) values ('Quote','Client')");
    await denied(newObject, [cover]);
  });
});
