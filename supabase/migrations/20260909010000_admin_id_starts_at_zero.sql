-- Admin numbering should start at 0, not 1 — the original account becomes
-- TTT0 instead of TTT1. It also predates the username-capture fix in
-- migration 20260731..., so it never got a username; set it explicitly.

UPDATE public.profiles
SET public_id = 'TTT0', username = 'Admin'
WHERE email = 'hello@trailtotides.com' AND public_id = 'TTT1';

-- Renumber the sequence so the next admin promotion draws TTT1, not TTT2.
SELECT setval('public.admin_public_id_seq', 1, false);
