-- =====================================================================
-- Rouviere · tabla de progreso en Supabase
-- Pegar entero en Supabase › SQL Editor › New query › Run. Se puede correr
-- más de una vez sin romper nada.
--
-- Una fila por estudiante con su progreso (lo mismo que la app guarda en el
-- teléfono). Las reglas RLS hacen que cada cuenta solo pueda leer y cambiar
-- SU fila: aunque la clave publicable esté en el código, nadie ve lo de otro.
-- =====================================================================

create table if not exists public.progreso (
  user_id     uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  datos       jsonb       not null default '{}'::jsonb,
  actualizado timestamptz not null default now()
);

comment on table public.progreso is
  'Progreso de estudio de cada cuenta de Rouviere (tarjetas, simulacros, exámenes...). Lo escribe src/rouviere/core/nube.js.';

alter table public.progreso enable row level security;

-- Solo las cuentas que iniciaron sesión, y solo sobre su propia fila.
grant select, insert, update on public.progreso to authenticated;
revoke all on public.progreso from anon;

drop policy if exists "ver mi progreso" on public.progreso;
create policy "ver mi progreso" on public.progreso
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "crear mi progreso" on public.progreso;
create policy "crear mi progreso" on public.progreso
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "cambiar mi progreso" on public.progreso;
create policy "cambiar mi progreso" on public.progreso
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
