-- Las tablas creadas después de 00003 no heredan el GRANT a service_role
-- ("permission denied for table bank_accounts"). Se otorga y se fijan
-- privilegios por defecto para que futuras tablas no repitan el problema.

grant all on table public.bank_accounts to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on functions to service_role;
