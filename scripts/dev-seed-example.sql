-- =============================================================================
-- DEV EXAMPLE DATABASE SEED
-- =============================================================================
-- Datos de ejemplo para desarrollo local. No contiene información sensible.
-- Incluye: 4 entidades, 6 productos de inversión, snapshots mensuales
--          (Ene 2023 – May 2026), 11 categorías y ~450 transacciones personales.
--
-- USO:
--   1. Ejecuta las migraciones de Prisma:  npx prisma migrate dev
--   2. Aplica este seed:                   psql $DATABASE_URL < scripts/dev-seed-example.sql
--   3. (O usa el seed JS):                 node scripts/seed-mock.mjs
--
-- Usuario dev placeholder: dev0000000000000000000001
-- Email: dev@example.com  |  No tiene contraseña — usa OAuth o cambia el ID
-- =============================================================================

-- Usuario de desarrollo (sin credenciales sensibles)
INSERT INTO public."User" (id, name, email, "emailVerified", image, "createdAt", "updatedAt")
VALUES (
  'dev0000000000000000000001',
  'Dev User',
  'dev@example.com',
  NOW(),
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

--
-- PostgreSQL database dump
--


-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: PersonalCategory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."PersonalCategory" VALUES ('m3a44e485973d56b6082ab3', 'dev0000000000000000000001', 'Salario', 'INCOME', 0, true, '2026-05-11 14:09:39.705');
INSERT INTO public."PersonalCategory" VALUES ('m9cbbccb52f2c6768076d86', 'dev0000000000000000000001', 'Extra / Freelance', 'INCOME', 1, true, '2026-05-11 14:09:39.705');
INSERT INTO public."PersonalCategory" VALUES ('m94078ce489396600153194', 'dev0000000000000000000001', 'Dividendos', 'INCOME', 2, true, '2026-05-11 14:09:39.706');
INSERT INTO public."PersonalCategory" VALUES ('mf5a1f55eab4119953f92bd', 'dev0000000000000000000001', 'Alimentación', 'EXPENSE', 3, true, '2026-05-11 14:09:39.706');
INSERT INTO public."PersonalCategory" VALUES ('m45aa650e8a78cd0dc3690c', 'dev0000000000000000000001', 'Transporte', 'EXPENSE', 4, true, '2026-05-11 14:09:39.706');
INSERT INTO public."PersonalCategory" VALUES ('md08e71f5d60a83d7e21d53', 'dev0000000000000000000001', 'Salud', 'EXPENSE', 5, true, '2026-05-11 14:09:39.707');
INSERT INTO public."PersonalCategory" VALUES ('m8fd0e4965b97a856d0f239', 'dev0000000000000000000001', 'Suscripciones', 'EXPENSE', 6, true, '2026-05-11 14:09:39.707');
INSERT INTO public."PersonalCategory" VALUES ('m1d61306d4477169ab0f25d', 'dev0000000000000000000001', 'Ropa', 'EXPENSE', 7, true, '2026-05-11 14:09:39.707');
INSERT INTO public."PersonalCategory" VALUES ('m473083ea17352b0e680190', 'dev0000000000000000000001', 'Ocio', 'EXPENSE', 8, true, '2026-05-11 14:09:39.707');
INSERT INTO public."PersonalCategory" VALUES ('m3af45f596c8ef1e583ad29', 'dev0000000000000000000001', 'Tecnología', 'EXPENSE', 9, true, '2026-05-11 14:09:39.708');
INSERT INTO public."PersonalCategory" VALUES ('m119b7caee854e8a14f1b9f', 'dev0000000000000000000001', 'Otros gastos', 'EXPENSE', 10, true, '2026-05-11 14:09:39.708');


--
-- Data for Name: PersonalTransaction; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."PersonalTransaction" VALUES ('m6b3bcba2bde6b8656fb8af', 'dev0000000000000000000001', 2023, 1, 1500, 'INCOME', 'm9cbbccb52f2c6768076d86', NULL, 'Paga extra enero', '2026-05-11 14:09:39.709');
INSERT INTO public."PersonalTransaction" VALUES ('m31da2c6fc32938acecc557', 'dev0000000000000000000001', 2024, 1, 2000, 'INCOME', 'm9cbbccb52f2c6768076d86', NULL, 'Paga extra enero', '2026-05-11 14:09:39.71');
INSERT INTO public."PersonalTransaction" VALUES ('mf39920b8508bfb06d7ae07', 'dev0000000000000000000001', 2025, 1, 2200, 'INCOME', 'm9cbbccb52f2c6768076d86', NULL, 'Paga extra enero', '2026-05-11 14:09:39.71');
INSERT INTO public."PersonalTransaction" VALUES ('m65b55b9a1a3378baa46d8a', 'dev0000000000000000000001', 2026, 1, 3000, 'INCOME', 'm9cbbccb52f2c6768076d86', NULL, 'Paga extra enero', '2026-05-11 14:09:39.71');
INSERT INTO public."PersonalTransaction" VALUES ('mceb3d9bcff1d49d58f5485', 'dev0000000000000000000001', 2023, 6, 900, 'INCOME', 'm9cbbccb52f2c6768076d86', NULL, 'Proyecto web freelance', '2026-05-11 14:09:39.71');
INSERT INTO public."PersonalTransaction" VALUES ('m726d68d3996a4fbfc9c1a6', 'dev0000000000000000000001', 2024, 4, 1200, 'INCOME', 'm9cbbccb52f2c6768076d86', NULL, 'Consultoría técnica', '2026-05-11 14:09:39.711');
INSERT INTO public."PersonalTransaction" VALUES ('m841fae6438345918a08430', 'dev0000000000000000000001', 2024, 9, 800, 'INCOME', 'm9cbbccb52f2c6768076d86', NULL, 'Formación interna empresa', '2026-05-11 14:09:39.711');
INSERT INTO public."PersonalTransaction" VALUES ('m39e23b84bae31ea18d56a6', 'dev0000000000000000000001', 2025, 3, 2500, 'INCOME', 'm9cbbccb52f2c6768076d86', NULL, 'Proyecto freelance — app móvil', '2026-05-11 14:09:39.711');
INSERT INTO public."PersonalTransaction" VALUES ('m48a75474a836915ec77305', 'dev0000000000000000000001', 2025, 10, 1800, 'INCOME', 'm9cbbccb52f2c6768076d86', NULL, 'Consultoría', '2026-05-11 14:09:39.712');
INSERT INTO public."PersonalTransaction" VALUES ('m9438dff8c3acbe42a03cdb', 'dev0000000000000000000001', 2026, 3, 3200, 'INCOME', 'm9cbbccb52f2c6768076d86', NULL, 'Proyecto datos — IA', '2026-05-11 14:09:39.712');
INSERT INTO public."PersonalTransaction" VALUES ('m80fd571770c2935954f2b8', 'dev0000000000000000000001', 2024, 6, 780, 'INCOME', 'm9cbbccb52f2c6768076d86', NULL, 'Devolución IRPF 2023', '2026-05-11 14:09:39.712');
INSERT INTO public."PersonalTransaction" VALUES ('m310f60e3843650b46c9a1c', 'dev0000000000000000000001', 2025, 6, 640, 'INCOME', 'm9cbbccb52f2c6768076d86', NULL, 'Devolución IRPF 2024', '2026-05-11 14:09:39.712');
INSERT INTO public."PersonalTransaction" VALUES ('m584ec4606135ccd3977b1e', 'dev0000000000000000000001', 2026, 6, 920, 'INCOME', 'm9cbbccb52f2c6768076d86', NULL, 'Devolución IRPF 2025', '2026-05-11 14:09:39.713');
INSERT INTO public."PersonalTransaction" VALUES ('mb441b1697ca454de5abcb6', 'dev0000000000000000000001', 2023, 12, 45, 'INCOME', 'm94078ce489396600153194', NULL, 'Dividendo VWCE', '2026-05-11 14:09:39.713');
INSERT INTO public."PersonalTransaction" VALUES ('mec9e09be3def738f1f16fd', 'dev0000000000000000000001', 2024, 6, 80, 'INCOME', 'm94078ce489396600153194', NULL, 'Dividendo VWCE', '2026-05-11 14:09:39.713');
INSERT INTO public."PersonalTransaction" VALUES ('m7ed7e20cee2e20005d91c6', 'dev0000000000000000000001', 2024, 12, 115, 'INCOME', 'm94078ce489396600153194', NULL, 'Dividendo VWCE', '2026-05-11 14:09:39.713');
INSERT INTO public."PersonalTransaction" VALUES ('m86619a86eadee5d503abc4', 'dev0000000000000000000001', 2025, 6, 145, 'INCOME', 'm94078ce489396600153194', NULL, 'Dividendo VWCE + SP500', '2026-05-11 14:09:39.714');
INSERT INTO public."PersonalTransaction" VALUES ('mc0d54810f6507c4e809a79', 'dev0000000000000000000001', 2025, 12, 170, 'INCOME', 'm94078ce489396600153194', NULL, 'Dividendo VWCE + SP500', '2026-05-11 14:09:39.714');
INSERT INTO public."PersonalTransaction" VALUES ('m569a39d17062d14641a9c6', 'dev0000000000000000000001', 2026, 5, 195, 'INCOME', 'm94078ce489396600153194', NULL, 'Dividendo VWCE + SP500', '2026-05-11 14:09:39.714');
INSERT INTO public."PersonalTransaction" VALUES ('m46aa030aa1e7117c26afa9', 'dev0000000000000000000001', 2022, 11, 2000, 'TRANSFER', NULL, 'mad4854c3b25440880d9765', 'Compra Bitcoin — 0.125 BTC', '2026-05-11 14:09:39.714');
INSERT INTO public."PersonalTransaction" VALUES ('m510461cb8aa3214c4d83f4', 'dev0000000000000000000001', 2023, 7, 500, 'TRANSFER', NULL, 'mad4854c3b25440880d9765', 'Compra Bitcoin — 0.019 BTC', '2026-05-11 14:09:39.715');
INSERT INTO public."PersonalTransaction" VALUES ('m80b334524a6e05ca385715', 'dev0000000000000000000001', 2023, 11, 1000, 'TRANSFER', NULL, 'mad4854c3b25440880d9765', 'Compra Bitcoin — 0.030 BTC', '2026-05-11 14:09:39.715');
INSERT INTO public."PersonalTransaction" VALUES ('m1a6c9971725a5b87fc69f5', 'dev0000000000000000000001', 2024, 10, 1500, 'TRANSFER', NULL, 'mad4854c3b25440880d9765', 'Compra Bitcoin — 0.025 BTC', '2026-05-11 14:09:39.715');
INSERT INTO public."PersonalTransaction" VALUES ('m653586b6a9059d65fc772b', 'dev0000000000000000000001', 2023, 9, 400, 'EXPENSE', 'm3af45f596c8ef1e583ad29', NULL, 'MacBook Pro — amortización', '2026-05-11 14:09:39.716');
INSERT INTO public."PersonalTransaction" VALUES ('mf29b812b33ed233b1876dd', 'dev0000000000000000000001', 2024, 3, 250, 'EXPENSE', 'm3af45f596c8ef1e583ad29', NULL, 'SSD externo + periféricos', '2026-05-11 14:09:39.716');
INSERT INTO public."PersonalTransaction" VALUES ('m4c8a15e4f3ea6332fe7a5d', 'dev0000000000000000000001', 2025, 1, 1200, 'EXPENSE', 'm3af45f596c8ef1e583ad29', NULL, 'iPad Pro', '2026-05-11 14:09:39.716');
INSERT INTO public."PersonalTransaction" VALUES ('m558dfe1da6ece05adb90af', 'dev0000000000000000000001', 2025, 8, 180, 'EXPENSE', 'm3af45f596c8ef1e583ad29', NULL, 'Suscripción anual software', '2026-05-11 14:09:39.717');
INSERT INTO public."PersonalTransaction" VALUES ('mb0634431e2b05435738e12', 'dev0000000000000000000001', 2026, 2, 350, 'EXPENSE', 'm3af45f596c8ef1e583ad29', NULL, 'Monitor 4K', '2026-05-11 14:09:39.717');
INSERT INTO public."PersonalTransaction" VALUES ('mb4b1f0bbae7c3bdacb7d47', 'dev0000000000000000000001', 2023, 1, 2000, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.717');
INSERT INTO public."PersonalTransaction" VALUES ('m0c6ee25aa09c5655f975f0', 'dev0000000000000000000001', 2023, 1, 285, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.717');
INSERT INTO public."PersonalTransaction" VALUES ('m57b296a95c1ccb34ee043f', 'dev0000000000000000000001', 2023, 1, 100, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.718');
INSERT INTO public."PersonalTransaction" VALUES ('m18f8cf8a5f8f8b3f90ba7e', 'dev0000000000000000000001', 2023, 1, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.718');
INSERT INTO public."PersonalTransaction" VALUES ('mf8b0a4182d588dc3653dce', 'dev0000000000000000000001', 2023, 1, 192, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.718');
INSERT INTO public."PersonalTransaction" VALUES ('m667272b4c95b3d125e554e', 'dev0000000000000000000001', 2023, 1, 48, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.718');
INSERT INTO public."PersonalTransaction" VALUES ('me44ed3cf35f88351cb7c76', 'dev0000000000000000000001', 2023, 1, 68, 'EXPENSE', 'md08e71f5d60a83d7e21d53', NULL, NULL, '2026-05-11 14:09:39.719');
INSERT INTO public."PersonalTransaction" VALUES ('mcc4f11213f272fe6c35f75', 'dev0000000000000000000001', 2023, 1, 53, 'EXPENSE', 'm1d61306d4477169ab0f25d', NULL, NULL, '2026-05-11 14:09:39.719');
INSERT INTO public."PersonalTransaction" VALUES ('mbb4db967f70623c48626c6', 'dev0000000000000000000001', 2023, 1, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.719');
INSERT INTO public."PersonalTransaction" VALUES ('ma8086a988357e43a87d326', 'dev0000000000000000000001', 2023, 1, 293, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.72');
INSERT INTO public."PersonalTransaction" VALUES ('me13775d9dbc430070dce85', 'dev0000000000000000000001', 2023, 2, 2000, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.72');
INSERT INTO public."PersonalTransaction" VALUES ('m8a6447e9a364e5fa33daa4', 'dev0000000000000000000001', 2023, 2, 258, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.72');
INSERT INTO public."PersonalTransaction" VALUES ('m9f2ac501f053c068a115dc', 'dev0000000000000000000001', 2023, 2, 125, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.72');
INSERT INTO public."PersonalTransaction" VALUES ('m35f542ad43b74308d86941', 'dev0000000000000000000001', 2023, 2, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.721');
INSERT INTO public."PersonalTransaction" VALUES ('m4e08473dca27a60d5d1a4f', 'dev0000000000000000000001', 2023, 2, 93, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.721');
INSERT INTO public."PersonalTransaction" VALUES ('me8f26285642723be130d6b', 'dev0000000000000000000001', 2023, 2, 32, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.721');
INSERT INTO public."PersonalTransaction" VALUES ('m75fe14e5c60b3f5d620903', 'dev0000000000000000000001', 2023, 2, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.721');
INSERT INTO public."PersonalTransaction" VALUES ('m4c4a6c5bc11a6b6b44424d', 'dev0000000000000000000001', 2023, 2, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.722');
INSERT INTO public."PersonalTransaction" VALUES ('m4f21e974a84d57d53821dd', 'dev0000000000000000000001', 2023, 2, 272, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.722');
INSERT INTO public."PersonalTransaction" VALUES ('m11d0df6f90752220c3f9a7', 'dev0000000000000000000001', 2023, 3, 2000, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.722');
INSERT INTO public."PersonalTransaction" VALUES ('m6bbb4fc3958b6c9a3be385', 'dev0000000000000000000001', 2023, 3, 246, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.722');
INSERT INTO public."PersonalTransaction" VALUES ('m132794ea8b833d7e7b7e67', 'dev0000000000000000000001', 2023, 3, 141, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.723');
INSERT INTO public."PersonalTransaction" VALUES ('m1bf815f08bd404dd491194', 'dev0000000000000000000001', 2023, 3, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.723');
INSERT INTO public."PersonalTransaction" VALUES ('ma728ed5ca36ad1f124ba0e', 'dev0000000000000000000001', 2023, 3, 106, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.723');
INSERT INTO public."PersonalTransaction" VALUES ('m14ccd1449030b2d3a85bef', 'dev0000000000000000000001', 2023, 3, 53, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.724');
INSERT INTO public."PersonalTransaction" VALUES ('m6bd4d194114c03684c49cf', 'dev0000000000000000000001', 2023, 3, 47, 'EXPENSE', 'm1d61306d4477169ab0f25d', NULL, NULL, '2026-05-11 14:09:39.724');
INSERT INTO public."PersonalTransaction" VALUES ('m67a8d9cc8aebff8cbcd538', 'dev0000000000000000000001', 2023, 3, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.724');
INSERT INTO public."PersonalTransaction" VALUES ('m91e07fd76acd941de27d38', 'dev0000000000000000000001', 2023, 3, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.724');
INSERT INTO public."PersonalTransaction" VALUES ('m2e742de2007015e703c0f3', 'dev0000000000000000000001', 2023, 4, 2000, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.725');
INSERT INTO public."PersonalTransaction" VALUES ('m5d520f6dfc0b180f630295', 'dev0000000000000000000001', 2023, 4, 313, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.725');
INSERT INTO public."PersonalTransaction" VALUES ('m21c2d617d1f035e4c38a48', 'dev0000000000000000000001', 2023, 4, 95, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.725');
INSERT INTO public."PersonalTransaction" VALUES ('m069dd3de130e13c9ff4941', 'dev0000000000000000000001', 2023, 4, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.725');
INSERT INTO public."PersonalTransaction" VALUES ('m051bac311aeed005e4b47e', 'dev0000000000000000000001', 2023, 4, 115, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.726');
INSERT INTO public."PersonalTransaction" VALUES ('ma5d10b039b275e93952b49', 'dev0000000000000000000001', 2023, 4, 43, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.726');
INSERT INTO public."PersonalTransaction" VALUES ('m8778fa8a652d49753bcba0', 'dev0000000000000000000001', 2023, 4, 109, 'EXPENSE', 'md08e71f5d60a83d7e21d53', NULL, NULL, '2026-05-11 14:09:39.726');
INSERT INTO public."PersonalTransaction" VALUES ('m8f86117486d020c9ab4a4e', 'dev0000000000000000000001', 2023, 4, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.726');
INSERT INTO public."PersonalTransaction" VALUES ('m6e2907d9d582ecc09b3bf8', 'dev0000000000000000000001', 2023, 4, 200, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.727');
INSERT INTO public."PersonalTransaction" VALUES ('me4847961f2c7c8ea06bf5e', 'dev0000000000000000000001', 2023, 4, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.727');
INSERT INTO public."PersonalTransaction" VALUES ('me4fed7f6fbd5277f3d8c5d', 'dev0000000000000000000001', 2023, 4, 296, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.727');
INSERT INTO public."PersonalTransaction" VALUES ('mc2879734ee7a9d6eea92e3', 'dev0000000000000000000001', 2023, 5, 2000, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.727');
INSERT INTO public."PersonalTransaction" VALUES ('m7fd5057a6eba8b37e70f32', 'dev0000000000000000000001', 2023, 5, 268, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.728');
INSERT INTO public."PersonalTransaction" VALUES ('m115bdf435d79ca0e18fcbd', 'dev0000000000000000000001', 2023, 5, 111, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.728');
INSERT INTO public."PersonalTransaction" VALUES ('m5ca3648940f6df8646dd0e', 'dev0000000000000000000001', 2023, 5, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.728');
INSERT INTO public."PersonalTransaction" VALUES ('ma6666b1fe4c5a47e9645f2', 'dev0000000000000000000001', 2023, 5, 94, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.728');
INSERT INTO public."PersonalTransaction" VALUES ('med6c07070d2bc852b4142b', 'dev0000000000000000000001', 2023, 5, 19, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.729');
INSERT INTO public."PersonalTransaction" VALUES ('m4b31c076acae06926c17e2', 'dev0000000000000000000001', 2023, 5, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.729');
INSERT INTO public."PersonalTransaction" VALUES ('m785c4f6b178755b2a6655f', 'dev0000000000000000000001', 2023, 5, 200, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.729');
INSERT INTO public."PersonalTransaction" VALUES ('ma1f70b17dec8cdbf2afad1', 'dev0000000000000000000001', 2023, 5, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.729');
INSERT INTO public."PersonalTransaction" VALUES ('ma1c1507e2d0923e08baa2c', 'dev0000000000000000000001', 2023, 6, 2000, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.73');
INSERT INTO public."PersonalTransaction" VALUES ('m3f59fd902715dff5df183b', 'dev0000000000000000000001', 2023, 6, 309, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.73');
INSERT INTO public."PersonalTransaction" VALUES ('m13a2d4435325224b930245', 'dev0000000000000000000001', 2023, 6, 96, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.73');
INSERT INTO public."PersonalTransaction" VALUES ('m1b9036b42a9af5de49fce8', 'dev0000000000000000000001', 2023, 6, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.73');
INSERT INTO public."PersonalTransaction" VALUES ('mac42b1e084c6c864e3dcfe', 'dev0000000000000000000001', 2023, 6, 184, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.731');
INSERT INTO public."PersonalTransaction" VALUES ('mb8b798f2ed212ce1e5fb3b', 'dev0000000000000000000001', 2023, 6, 38, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.731');
INSERT INTO public."PersonalTransaction" VALUES ('mf11a5aa16df95f5a7d4247', 'dev0000000000000000000001', 2023, 6, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.731');
INSERT INTO public."PersonalTransaction" VALUES ('m65ae9615a7de66b5a01960', 'dev0000000000000000000001', 2023, 6, 200, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.731');
INSERT INTO public."PersonalTransaction" VALUES ('m8e8373c48ee92eea275c03', 'dev0000000000000000000001', 2023, 6, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.732');
INSERT INTO public."PersonalTransaction" VALUES ('m6aa56fc906a131fffdfdf0', 'dev0000000000000000000001', 2023, 6, 84, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.732');
INSERT INTO public."PersonalTransaction" VALUES ('mbddd4f2465180a92ca5448', 'dev0000000000000000000001', 2023, 7, 2000, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.732');
INSERT INTO public."PersonalTransaction" VALUES ('mdf9bfcac33af59cba97496', 'dev0000000000000000000001', 2023, 7, 297, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.732');
INSERT INTO public."PersonalTransaction" VALUES ('m43a37b7c0577c4e822cdd6', 'dev0000000000000000000001', 2023, 7, 103, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.733');
INSERT INTO public."PersonalTransaction" VALUES ('macca1eeaddbe5d84cb796d', 'dev0000000000000000000001', 2023, 7, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.733');
INSERT INTO public."PersonalTransaction" VALUES ('m865068a8534b360ae798ec', 'dev0000000000000000000001', 2023, 7, 182, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.733');
INSERT INTO public."PersonalTransaction" VALUES ('mc077e155c65305874679d0', 'dev0000000000000000000001', 2023, 7, 43, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.733');
INSERT INTO public."PersonalTransaction" VALUES ('md780da89afd25ab16f069d', 'dev0000000000000000000001', 2023, 7, 101, 'EXPENSE', 'md08e71f5d60a83d7e21d53', NULL, NULL, '2026-05-11 14:09:39.734');
INSERT INTO public."PersonalTransaction" VALUES ('m1fb859e34a1fe5787d8dc9', 'dev0000000000000000000001', 2023, 7, 91, 'EXPENSE', 'm1d61306d4477169ab0f25d', NULL, NULL, '2026-05-11 14:09:39.734');
INSERT INTO public."PersonalTransaction" VALUES ('mbf454abcafe84d6dba53f6', 'dev0000000000000000000001', 2023, 7, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.734');
INSERT INTO public."PersonalTransaction" VALUES ('m30b4aaa2de2c759a4b9c8f', 'dev0000000000000000000001', 2023, 7, 200, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.734');
INSERT INTO public."PersonalTransaction" VALUES ('m7ab69c4eaec230c1ae67be', 'dev0000000000000000000001', 2023, 7, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.735');
INSERT INTO public."PersonalTransaction" VALUES ('m1962240b41eef4023b9621', 'dev0000000000000000000001', 2023, 8, 2000, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.735');
INSERT INTO public."PersonalTransaction" VALUES ('ma75a0def006b27dc84f1ea', 'dev0000000000000000000001', 2023, 8, 344, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.735');
INSERT INTO public."PersonalTransaction" VALUES ('mc29b1245fab546c58bc4fe', 'dev0000000000000000000001', 2023, 8, 111, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.735');
INSERT INTO public."PersonalTransaction" VALUES ('m7ba960d77e533507742796', 'dev0000000000000000000001', 2023, 8, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.736');
INSERT INTO public."PersonalTransaction" VALUES ('m8cfb9e5d9edc9c595df613', 'dev0000000000000000000001', 2023, 8, 146, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.736');
INSERT INTO public."PersonalTransaction" VALUES ('m23549e9519689561d81b62', 'dev0000000000000000000001', 2023, 8, 10, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.736');
INSERT INTO public."PersonalTransaction" VALUES ('m2ac7b5434a1d265daf0c43', 'dev0000000000000000000001', 2023, 8, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.736');
INSERT INTO public."PersonalTransaction" VALUES ('m59e29496a2e48c15faaa02', 'dev0000000000000000000001', 2023, 8, 200, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.737');
INSERT INTO public."PersonalTransaction" VALUES ('m0282288d9d9fcf8cbf1fa1', 'dev0000000000000000000001', 2023, 8, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.737');
INSERT INTO public."PersonalTransaction" VALUES ('m18971eb5f7dea1390f0b30', 'dev0000000000000000000001', 2023, 8, 164, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.737');
INSERT INTO public."PersonalTransaction" VALUES ('m294217e0230252d2c13d4c', 'dev0000000000000000000001', 2023, 9, 2000, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.737');
INSERT INTO public."PersonalTransaction" VALUES ('m6ecf5909cc3407ec1d6ee7', 'dev0000000000000000000001', 2023, 9, 345, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.738');
INSERT INTO public."PersonalTransaction" VALUES ('m622d9eecbc635569933d65', 'dev0000000000000000000001', 2023, 9, 75, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.738');
INSERT INTO public."PersonalTransaction" VALUES ('m210a9f6b31a4aadf410230', 'dev0000000000000000000001', 2023, 9, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.738');
INSERT INTO public."PersonalTransaction" VALUES ('mf1f902f3809f8ff1bda911', 'dev0000000000000000000001', 2023, 9, 151, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.739');
INSERT INTO public."PersonalTransaction" VALUES ('m5e88db44e4348207a409df', 'dev0000000000000000000001', 2023, 9, 58, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.739');
INSERT INTO public."PersonalTransaction" VALUES ('me9bfcd07ffdcde844261c9', 'dev0000000000000000000001', 2023, 9, 48, 'EXPENSE', 'm1d61306d4477169ab0f25d', NULL, NULL, '2026-05-11 14:09:39.739');
INSERT INTO public."PersonalTransaction" VALUES ('m8e3b833709ed74fc68fc21', 'dev0000000000000000000001', 2023, 9, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.739');
INSERT INTO public."PersonalTransaction" VALUES ('mef2054d8453745a289db4c', 'dev0000000000000000000001', 2023, 9, 200, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.74');
INSERT INTO public."PersonalTransaction" VALUES ('me99677a6cb32bb3d489874', 'dev0000000000000000000001', 2023, 9, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.74');
INSERT INTO public."PersonalTransaction" VALUES ('m9b2030ca8b4685b1289d4c', 'dev0000000000000000000001', 2023, 9, 233, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.74');
INSERT INTO public."PersonalTransaction" VALUES ('m2e3c597a5ac5dca333b931', 'dev0000000000000000000001', 2023, 10, 2000, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.74');
INSERT INTO public."PersonalTransaction" VALUES ('mbea76c7c48595269660952', 'dev0000000000000000000001', 2023, 10, 269, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.74');
INSERT INTO public."PersonalTransaction" VALUES ('m06c41eabad88ef01415808', 'dev0000000000000000000001', 2023, 10, 109, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.741');
INSERT INTO public."PersonalTransaction" VALUES ('mf5a5d0478b7f934f7af0c8', 'dev0000000000000000000001', 2023, 10, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.741');
INSERT INTO public."PersonalTransaction" VALUES ('m08b2efdd9adf38bbfcffe3', 'dev0000000000000000000001', 2023, 10, 186, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.741');
INSERT INTO public."PersonalTransaction" VALUES ('m2e7eb982c81f41f1b61b44', 'dev0000000000000000000001', 2023, 10, 15, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.742');
INSERT INTO public."PersonalTransaction" VALUES ('medd2516c99f2dd6e442a4d', 'dev0000000000000000000001', 2023, 10, 116, 'EXPENSE', 'md08e71f5d60a83d7e21d53', NULL, NULL, '2026-05-11 14:09:39.742');
INSERT INTO public."PersonalTransaction" VALUES ('maca0ad920d82d4b6f2887d', 'dev0000000000000000000001', 2023, 10, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.742');
INSERT INTO public."PersonalTransaction" VALUES ('m8bdc0230b96adad75c39dd', 'dev0000000000000000000001', 2023, 10, 200, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.742');
INSERT INTO public."PersonalTransaction" VALUES ('m1925e194dc32081a0cf6b5', 'dev0000000000000000000001', 2023, 10, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.742');
INSERT INTO public."PersonalTransaction" VALUES ('m6ff419c62a7be6a2e91883', 'dev0000000000000000000001', 2023, 10, 210, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.743');
INSERT INTO public."PersonalTransaction" VALUES ('mebb1d5d4f7b2190c28472a', 'dev0000000000000000000001', 2023, 11, 2000, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.743');
INSERT INTO public."PersonalTransaction" VALUES ('m652fe64114e79cf6aeaf0e', 'dev0000000000000000000001', 2023, 11, 231, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.743');
INSERT INTO public."PersonalTransaction" VALUES ('m7fbb99431287b76125385e', 'dev0000000000000000000001', 2023, 11, 95, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.743');
INSERT INTO public."PersonalTransaction" VALUES ('m894ccdef91e8e7344cae20', 'dev0000000000000000000001', 2023, 11, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.744');
INSERT INTO public."PersonalTransaction" VALUES ('m22ce0db83ac17fa7de4205', 'dev0000000000000000000001', 2023, 11, 128, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.744');
INSERT INTO public."PersonalTransaction" VALUES ('me6f22129874d7ff4ab6fee', 'dev0000000000000000000001', 2023, 11, 25, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.744');
INSERT INTO public."PersonalTransaction" VALUES ('m35ed213c04b1adcf322b13', 'dev0000000000000000000001', 2023, 11, 90, 'EXPENSE', 'm1d61306d4477169ab0f25d', NULL, NULL, '2026-05-11 14:09:39.744');
INSERT INTO public."PersonalTransaction" VALUES ('mcc926cc83bd53f24d9d2e6', 'dev0000000000000000000001', 2023, 11, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.745');
INSERT INTO public."PersonalTransaction" VALUES ('md0c1f935840a69dff52541', 'dev0000000000000000000001', 2023, 11, 200, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.745');
INSERT INTO public."PersonalTransaction" VALUES ('ma3b2269e7222d716490c17', 'dev0000000000000000000001', 2023, 11, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.745');
INSERT INTO public."PersonalTransaction" VALUES ('m03add9b2ce6840739beac6', 'dev0000000000000000000001', 2023, 12, 2000, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.745');
INSERT INTO public."PersonalTransaction" VALUES ('mc720c015e270a7e34ac510', 'dev0000000000000000000001', 2023, 12, 323, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.746');
INSERT INTO public."PersonalTransaction" VALUES ('mcc3bb7f515894ef7c5fb81', 'dev0000000000000000000001', 2023, 12, 113, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.746');
INSERT INTO public."PersonalTransaction" VALUES ('md5b214c90d4a54f7c13267', 'dev0000000000000000000001', 2023, 12, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.746');
INSERT INTO public."PersonalTransaction" VALUES ('mb6d141659ca48eb5cd2e08', 'dev0000000000000000000001', 2023, 12, 142, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.746');
INSERT INTO public."PersonalTransaction" VALUES ('me0b21108d2d8f65ba07204', 'dev0000000000000000000001', 2023, 12, 28, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.747');
INSERT INTO public."PersonalTransaction" VALUES ('m9595ec8c2547412fa9cb5e', 'dev0000000000000000000001', 2023, 12, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.747');
INSERT INTO public."PersonalTransaction" VALUES ('me6529f94c8bb6daddc236c', 'dev0000000000000000000001', 2023, 12, 200, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.747');
INSERT INTO public."PersonalTransaction" VALUES ('m80d2f60aa34204cf30824c', 'dev0000000000000000000001', 2023, 12, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.747');
INSERT INTO public."PersonalTransaction" VALUES ('m45e461271bfaaf65f45a6d', 'dev0000000000000000000001', 2023, 12, 197, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.748');
INSERT INTO public."PersonalTransaction" VALUES ('m737d25cec562d67278e4cf', 'dev0000000000000000000001', 2024, 1, 2100, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.748');
INSERT INTO public."PersonalTransaction" VALUES ('m6a58f7b2408c4929ce3ccf', 'dev0000000000000000000001', 2024, 1, 334, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.748');
INSERT INTO public."PersonalTransaction" VALUES ('m11e8b5460f01aa36f9546c', 'dev0000000000000000000001', 2024, 1, 91, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.748');
INSERT INTO public."PersonalTransaction" VALUES ('m03886e369127c9afc1027b', 'dev0000000000000000000001', 2024, 1, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.749');
INSERT INTO public."PersonalTransaction" VALUES ('m179230cb692cfe580c0e5e', 'dev0000000000000000000001', 2024, 1, 156, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.749');
INSERT INTO public."PersonalTransaction" VALUES ('m3578c1bfbd18447d2dddaa', 'dev0000000000000000000001', 2024, 1, 23, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.749');
INSERT INTO public."PersonalTransaction" VALUES ('m04127bb807024d660c9007', 'dev0000000000000000000001', 2024, 1, 44, 'EXPENSE', 'md08e71f5d60a83d7e21d53', NULL, NULL, '2026-05-11 14:09:39.749');
INSERT INTO public."PersonalTransaction" VALUES ('m7a9332877a6512a9dfb3a1', 'dev0000000000000000000001', 2024, 1, 36, 'EXPENSE', 'm1d61306d4477169ab0f25d', NULL, NULL, '2026-05-11 14:09:39.75');
INSERT INTO public."PersonalTransaction" VALUES ('m95d6cc1550cdc170eb063d', 'dev0000000000000000000001', 2024, 1, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.75');
INSERT INTO public."PersonalTransaction" VALUES ('m21f9f846359369e118fb1e', 'dev0000000000000000000001', 2024, 1, 200, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.75');
INSERT INTO public."PersonalTransaction" VALUES ('ma59e5565f1ce8cef755554', 'dev0000000000000000000001', 2024, 1, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.751');
INSERT INTO public."PersonalTransaction" VALUES ('m88446c013e6c6c13f63a68', 'dev0000000000000000000001', 2024, 1, 222, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.751');
INSERT INTO public."PersonalTransaction" VALUES ('m42d57aef81a8dea99a876e', 'dev0000000000000000000001', 2024, 2, 2100, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.751');
INSERT INTO public."PersonalTransaction" VALUES ('md35209b0b4ed99f82924bc', 'dev0000000000000000000001', 2024, 2, 241, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.752');
INSERT INTO public."PersonalTransaction" VALUES ('m93e0ee159f3de295478c29', 'dev0000000000000000000001', 2024, 2, 94, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.752');
INSERT INTO public."PersonalTransaction" VALUES ('mdc5862e5a4ce913949e4eb', 'dev0000000000000000000001', 2024, 2, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.752');
INSERT INTO public."PersonalTransaction" VALUES ('mf68e135e161271223250c1', 'dev0000000000000000000001', 2024, 2, 173, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.753');
INSERT INTO public."PersonalTransaction" VALUES ('m7219907b9126b50f229c79', 'dev0000000000000000000001', 2024, 2, 44, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.753');
INSERT INTO public."PersonalTransaction" VALUES ('ma8e902e31acee54f7ada62', 'dev0000000000000000000001', 2024, 2, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.753');
INSERT INTO public."PersonalTransaction" VALUES ('me734d028293decfe41e919', 'dev0000000000000000000001', 2024, 2, 200, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.753');
INSERT INTO public."PersonalTransaction" VALUES ('m37b78899481a5c4329fff5', 'dev0000000000000000000001', 2024, 2, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.754');
INSERT INTO public."PersonalTransaction" VALUES ('m328b79e464aa19085e8ad9', 'dev0000000000000000000001', 2024, 2, 313, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.754');
INSERT INTO public."PersonalTransaction" VALUES ('me3e0864bd2ddb62d985f58', 'dev0000000000000000000001', 2024, 3, 2100, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.754');
INSERT INTO public."PersonalTransaction" VALUES ('m0e8ea00f6c74164f9b39b3', 'dev0000000000000000000001', 2024, 3, 281, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.754');
INSERT INTO public."PersonalTransaction" VALUES ('m16ede35589f314eec43127', 'dev0000000000000000000001', 2024, 3, 124, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.755');
INSERT INTO public."PersonalTransaction" VALUES ('m5217b13a032f956423eb0b', 'dev0000000000000000000001', 2024, 3, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.755');
INSERT INTO public."PersonalTransaction" VALUES ('me4585eff03d49727de4aa9', 'dev0000000000000000000001', 2024, 3, 102, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.755');
INSERT INTO public."PersonalTransaction" VALUES ('m1631bccfbda52f1ac44faf', 'dev0000000000000000000001', 2024, 3, 45, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.756');
INSERT INTO public."PersonalTransaction" VALUES ('m193039de0aaab35f4a9f25', 'dev0000000000000000000001', 2024, 3, 125, 'EXPENSE', 'm1d61306d4477169ab0f25d', NULL, NULL, '2026-05-11 14:09:39.756');
INSERT INTO public."PersonalTransaction" VALUES ('m8c20163721137f5b5538fc', 'dev0000000000000000000001', 2024, 3, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.756');
INSERT INTO public."PersonalTransaction" VALUES ('me5ff70fcbc44769019964f', 'dev0000000000000000000001', 2024, 3, 200, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.756');
INSERT INTO public."PersonalTransaction" VALUES ('mb3a64015d825d3db8cbf05', 'dev0000000000000000000001', 2024, 3, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.757');
INSERT INTO public."PersonalTransaction" VALUES ('m81a8e69176d93618e73d67', 'dev0000000000000000000001', 2024, 4, 2100, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.757');
INSERT INTO public."PersonalTransaction" VALUES ('m02d16aa4900c3c64de97a7', 'dev0000000000000000000001', 2024, 4, 272, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.757');
INSERT INTO public."PersonalTransaction" VALUES ('m7e5e6489a447a5a8a6a435', 'dev0000000000000000000001', 2024, 4, 109, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.757');
INSERT INTO public."PersonalTransaction" VALUES ('meccd7dececa35a47a614e3', 'dev0000000000000000000001', 2024, 4, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.758');
INSERT INTO public."PersonalTransaction" VALUES ('m72880c867a1e9e0eb6c4fd', 'dev0000000000000000000001', 2024, 4, 125, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.758');
INSERT INTO public."PersonalTransaction" VALUES ('m3af97e418cc466c0088ba6', 'dev0000000000000000000001', 2024, 4, 41, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.758');
INSERT INTO public."PersonalTransaction" VALUES ('m60bd53ff8c341457d91620', 'dev0000000000000000000001', 2024, 4, 31, 'EXPENSE', 'md08e71f5d60a83d7e21d53', NULL, NULL, '2026-05-11 14:09:39.758');
INSERT INTO public."PersonalTransaction" VALUES ('m4470081cb18c147cd6b4b3', 'dev0000000000000000000001', 2024, 4, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.759');
INSERT INTO public."PersonalTransaction" VALUES ('m2749ff89f77de59ecc4cbe', 'dev0000000000000000000001', 2024, 4, 200, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.759');
INSERT INTO public."PersonalTransaction" VALUES ('mb3e21c631c023727bcc290', 'dev0000000000000000000001', 2024, 4, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.759');
INSERT INTO public."PersonalTransaction" VALUES ('m2aa5124175e76598d5464e', 'dev0000000000000000000001', 2024, 4, 365, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.759');
INSERT INTO public."PersonalTransaction" VALUES ('m0619d9e467120a18e4f4de', 'dev0000000000000000000001', 2024, 5, 2100, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.76');
INSERT INTO public."PersonalTransaction" VALUES ('m5998b13c6a50b79fc6f1b7', 'dev0000000000000000000001', 2024, 5, 358, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.76');
INSERT INTO public."PersonalTransaction" VALUES ('m512e724e9aab022dd58bcd', 'dev0000000000000000000001', 2024, 5, 125, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.76');
INSERT INTO public."PersonalTransaction" VALUES ('mf581955c6dff1b16c3717f', 'dev0000000000000000000001', 2024, 5, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.76');
INSERT INTO public."PersonalTransaction" VALUES ('m5b9bdf8aae84f26e8efe8d', 'dev0000000000000000000001', 2024, 5, 123, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.761');
INSERT INTO public."PersonalTransaction" VALUES ('m51aa4db4d0a3650d807e2e', 'dev0000000000000000000001', 2024, 5, 31, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.761');
INSERT INTO public."PersonalTransaction" VALUES ('m3089d424b863ed98b4504b', 'dev0000000000000000000001', 2024, 5, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.761');
INSERT INTO public."PersonalTransaction" VALUES ('m524e8e559350312420db60', 'dev0000000000000000000001', 2024, 5, 200, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.761');
INSERT INTO public."PersonalTransaction" VALUES ('m29ffd81540a921bbee2295', 'dev0000000000000000000001', 2024, 5, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.762');
INSERT INTO public."PersonalTransaction" VALUES ('mfc2a9d816c79043d51b67e', 'dev0000000000000000000001', 2024, 6, 2100, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.762');
INSERT INTO public."PersonalTransaction" VALUES ('ma6bcbb318fe40f39a10d07', 'dev0000000000000000000001', 2024, 6, 214, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.762');
INSERT INTO public."PersonalTransaction" VALUES ('m116d00d90a6696f163a294', 'dev0000000000000000000001', 2024, 6, 112, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.763');
INSERT INTO public."PersonalTransaction" VALUES ('mc9e5efd0260f5cf8a880ef', 'dev0000000000000000000001', 2024, 6, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.763');
INSERT INTO public."PersonalTransaction" VALUES ('m416e56a01c99fde2449078', 'dev0000000000000000000001', 2024, 6, 186, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.763');
INSERT INTO public."PersonalTransaction" VALUES ('ma4eae8170279f4db0d165b', 'dev0000000000000000000001', 2024, 6, 57, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.763');
INSERT INTO public."PersonalTransaction" VALUES ('md23f057508933408acf57d', 'dev0000000000000000000001', 2024, 6, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.764');
INSERT INTO public."PersonalTransaction" VALUES ('mf723a9020424aacb12771c', 'dev0000000000000000000001', 2024, 6, 200, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.764');
INSERT INTO public."PersonalTransaction" VALUES ('mab32cd21fca54571b179a7', 'dev0000000000000000000001', 2024, 6, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.764');
INSERT INTO public."PersonalTransaction" VALUES ('md85e10a7e1b65b65052193', 'dev0000000000000000000001', 2024, 6, 197, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.764');
INSERT INTO public."PersonalTransaction" VALUES ('mc0c9f8ce87dd5c40cad351', 'dev0000000000000000000001', 2024, 7, 2100, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.765');
INSERT INTO public."PersonalTransaction" VALUES ('m6c30d006d6350c1a665b6d', 'dev0000000000000000000001', 2024, 7, 357, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.765');
INSERT INTO public."PersonalTransaction" VALUES ('mb647587e02328f359f4b01', 'dev0000000000000000000001', 2024, 7, 94, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.765');
INSERT INTO public."PersonalTransaction" VALUES ('ma7aea63d5ddf2d3471102a', 'dev0000000000000000000001', 2024, 7, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.766');
INSERT INTO public."PersonalTransaction" VALUES ('md9e655ca8d836d8d86d983', 'dev0000000000000000000001', 2024, 7, 101, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.766');
INSERT INTO public."PersonalTransaction" VALUES ('m6dcde4b235f312bbe4eaa9', 'dev0000000000000000000001', 2024, 7, 53, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.766');
INSERT INTO public."PersonalTransaction" VALUES ('mec16bebc1f5e8ce4d70c66', 'dev0000000000000000000001', 2024, 7, 79, 'EXPENSE', 'md08e71f5d60a83d7e21d53', NULL, NULL, '2026-05-11 14:09:39.766');
INSERT INTO public."PersonalTransaction" VALUES ('m0007bffd78d0761ac8b8cc', 'dev0000000000000000000001', 2024, 7, 98, 'EXPENSE', 'm1d61306d4477169ab0f25d', NULL, NULL, '2026-05-11 14:09:39.767');
INSERT INTO public."PersonalTransaction" VALUES ('mf44fc95b20ba62a8c468a6', 'dev0000000000000000000001', 2024, 7, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.767');
INSERT INTO public."PersonalTransaction" VALUES ('m47637e0dbcadbd4d977dc3', 'dev0000000000000000000001', 2024, 7, 200, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.767');
INSERT INTO public."PersonalTransaction" VALUES ('m87432af3809107783013b6', 'dev0000000000000000000001', 2024, 7, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.768');
INSERT INTO public."PersonalTransaction" VALUES ('m7a8b971a2a23ffb01059e0', 'dev0000000000000000000001', 2024, 8, 2100, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.768');
INSERT INTO public."PersonalTransaction" VALUES ('m537c0e81189511615b9313', 'dev0000000000000000000001', 2024, 8, 309, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.768');
INSERT INTO public."PersonalTransaction" VALUES ('m688e5f20c06cc1ad290f08', 'dev0000000000000000000001', 2024, 8, 90, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.768');
INSERT INTO public."PersonalTransaction" VALUES ('m55e43c5803fa6971fd5cca', 'dev0000000000000000000001', 2024, 8, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.769');
INSERT INTO public."PersonalTransaction" VALUES ('m6ba5414280eec135fd3106', 'dev0000000000000000000001', 2024, 8, 178, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.769');
INSERT INTO public."PersonalTransaction" VALUES ('mbc2a69804bdad8a0ab259d', 'dev0000000000000000000001', 2024, 8, 61, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.769');
INSERT INTO public."PersonalTransaction" VALUES ('m0d4565e44935d3b434d1fd', 'dev0000000000000000000001', 2024, 8, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.769');
INSERT INTO public."PersonalTransaction" VALUES ('m2a5ef7d01f6732251c3f34', 'dev0000000000000000000001', 2024, 8, 200, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.77');
INSERT INTO public."PersonalTransaction" VALUES ('me52541e077ca326c49b4c4', 'dev0000000000000000000001', 2024, 8, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.77');
INSERT INTO public."PersonalTransaction" VALUES ('mc901d150bac00af2c79db7', 'dev0000000000000000000001', 2024, 8, 295, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.77');
INSERT INTO public."PersonalTransaction" VALUES ('m936a97f713acda1587c732', 'dev0000000000000000000001', 2024, 9, 2100, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.77');
INSERT INTO public."PersonalTransaction" VALUES ('mb6e99507c323455532951b', 'dev0000000000000000000001', 2024, 9, 278, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.771');
INSERT INTO public."PersonalTransaction" VALUES ('m0e8d6c9b76cf4a8c0a5e0a', 'dev0000000000000000000001', 2024, 9, 119, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.771');
INSERT INTO public."PersonalTransaction" VALUES ('mceb920e3a6e46e377ba637', 'dev0000000000000000000001', 2024, 9, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.771');
INSERT INTO public."PersonalTransaction" VALUES ('m02ec75b92cf226b4bdec9d', 'dev0000000000000000000001', 2024, 9, 191, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.771');
INSERT INTO public."PersonalTransaction" VALUES ('m127c8bbd9321a25707f0c0', 'dev0000000000000000000001', 2024, 9, 6, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.771');
INSERT INTO public."PersonalTransaction" VALUES ('m4d974a9efcbc449254b86d', 'dev0000000000000000000001', 2024, 9, 54, 'EXPENSE', 'm1d61306d4477169ab0f25d', NULL, NULL, '2026-05-11 14:09:39.772');
INSERT INTO public."PersonalTransaction" VALUES ('m85dcf4b46367a1158de134', 'dev0000000000000000000001', 2024, 9, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.772');
INSERT INTO public."PersonalTransaction" VALUES ('md5e40a0076baf0fb94480e', 'dev0000000000000000000001', 2024, 9, 200, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.772');
INSERT INTO public."PersonalTransaction" VALUES ('m2d9470d38c864ea94a1095', 'dev0000000000000000000001', 2024, 9, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.772');
INSERT INTO public."PersonalTransaction" VALUES ('mdd15bffb1b8eb311319637', 'dev0000000000000000000001', 2024, 9, 212, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.773');
INSERT INTO public."PersonalTransaction" VALUES ('m747b12577314255e05030e', 'dev0000000000000000000001', 2024, 10, 2100, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.773');
INSERT INTO public."PersonalTransaction" VALUES ('m0beff14ac6a67633358a0b', 'dev0000000000000000000001', 2024, 10, 259, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.773');
INSERT INTO public."PersonalTransaction" VALUES ('maa8d4d47a9f2296a0c51cd', 'dev0000000000000000000001', 2024, 10, 137, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.773');
INSERT INTO public."PersonalTransaction" VALUES ('md127bdc6546caffe04183c', 'dev0000000000000000000001', 2024, 10, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.774');
INSERT INTO public."PersonalTransaction" VALUES ('m6d2acddd67c55639365abf', 'dev0000000000000000000001', 2024, 10, 100, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.774');
INSERT INTO public."PersonalTransaction" VALUES ('m2b3b72689d7727d31ddf0f', 'dev0000000000000000000001', 2024, 10, 43, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.774');
INSERT INTO public."PersonalTransaction" VALUES ('m4a98c19d26e31f86d2791c', 'dev0000000000000000000001', 2024, 10, 90, 'EXPENSE', 'md08e71f5d60a83d7e21d53', NULL, NULL, '2026-05-11 14:09:39.775');
INSERT INTO public."PersonalTransaction" VALUES ('m317362fc5afcc03ba121b6', 'dev0000000000000000000001', 2024, 10, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.775');
INSERT INTO public."PersonalTransaction" VALUES ('mbe4a92db751cb4169f352e', 'dev0000000000000000000001', 2024, 10, 200, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.775');
INSERT INTO public."PersonalTransaction" VALUES ('mf0c7e11651ee609eda11df', 'dev0000000000000000000001', 2024, 10, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.776');
INSERT INTO public."PersonalTransaction" VALUES ('m514ff5745504601b73ac42', 'dev0000000000000000000001', 2024, 10, 294, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.776');
INSERT INTO public."PersonalTransaction" VALUES ('mf276aad3af5defe699029b', 'dev0000000000000000000001', 2024, 11, 2100, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.776');
INSERT INTO public."PersonalTransaction" VALUES ('mfa1f106c9283b0201bd7e2', 'dev0000000000000000000001', 2024, 11, 347, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.776');
INSERT INTO public."PersonalTransaction" VALUES ('m8b54913dcd059e1ac98916', 'dev0000000000000000000001', 2024, 11, 120, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.777');
INSERT INTO public."PersonalTransaction" VALUES ('m0104611965b4f8344bab53', 'dev0000000000000000000001', 2024, 11, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.777');
INSERT INTO public."PersonalTransaction" VALUES ('m663713af1e7c674693d781', 'dev0000000000000000000001', 2024, 11, 148, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.777');
INSERT INTO public."PersonalTransaction" VALUES ('m6dcac9d924dd1d54a872e7', 'dev0000000000000000000001', 2024, 11, 61, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.777');
INSERT INTO public."PersonalTransaction" VALUES ('m2f9ad9d068b3160af1df55', 'dev0000000000000000000001', 2024, 11, 137, 'EXPENSE', 'm1d61306d4477169ab0f25d', NULL, NULL, '2026-05-11 14:09:39.778');
INSERT INTO public."PersonalTransaction" VALUES ('mba4a4c3f05447869f6294a', 'dev0000000000000000000001', 2024, 11, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.778');
INSERT INTO public."PersonalTransaction" VALUES ('mc65283c4ee88258225466b', 'dev0000000000000000000001', 2024, 11, 200, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.778');
INSERT INTO public."PersonalTransaction" VALUES ('m8919d09bfe577ef2e2fa67', 'dev0000000000000000000001', 2024, 11, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.779');
INSERT INTO public."PersonalTransaction" VALUES ('m96a749d50a22422c00670a', 'dev0000000000000000000001', 2024, 12, 2100, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.779');
INSERT INTO public."PersonalTransaction" VALUES ('m646c695460495c22fafa61', 'dev0000000000000000000001', 2024, 12, 238, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.78');
INSERT INTO public."PersonalTransaction" VALUES ('m130f8745c9aee2328e36db', 'dev0000000000000000000001', 2024, 12, 92, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.78');
INSERT INTO public."PersonalTransaction" VALUES ('ma18d167e8ad24820d96fc8', 'dev0000000000000000000001', 2024, 12, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.78');
INSERT INTO public."PersonalTransaction" VALUES ('mcf11647a283c58c8e641b6', 'dev0000000000000000000001', 2024, 12, 113, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.78');
INSERT INTO public."PersonalTransaction" VALUES ('mc4ef21827f26cab85da883', 'dev0000000000000000000001', 2024, 12, 48, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.781');
INSERT INTO public."PersonalTransaction" VALUES ('m1dfbc108ba05d044d54fb1', 'dev0000000000000000000001', 2024, 12, 300, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.781');
INSERT INTO public."PersonalTransaction" VALUES ('m30b4edcfc485359ab9bb3d', 'dev0000000000000000000001', 2024, 12, 200, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.781');
INSERT INTO public."PersonalTransaction" VALUES ('mbebd28d1ead892df14f125', 'dev0000000000000000000001', 2024, 12, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.782');
INSERT INTO public."PersonalTransaction" VALUES ('md49e1b39a66e9447443ce3', 'dev0000000000000000000001', 2024, 12, 409, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.782');
INSERT INTO public."PersonalTransaction" VALUES ('m94bd60e00c917d20b69afc', 'dev0000000000000000000001', 2025, 1, 2200, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.782');
INSERT INTO public."PersonalTransaction" VALUES ('m5bd9a6b195f899a64ed293', 'dev0000000000000000000001', 2025, 1, 239, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.783');
INSERT INTO public."PersonalTransaction" VALUES ('m51c2ddb4523a4d6881fb79', 'dev0000000000000000000001', 2025, 1, 88, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.783');
INSERT INTO public."PersonalTransaction" VALUES ('mf601bd886f34eab2c43a21', 'dev0000000000000000000001', 2025, 1, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.783');
INSERT INTO public."PersonalTransaction" VALUES ('m703970a1d61267dda65a0b', 'dev0000000000000000000001', 2025, 1, 143, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.783');
INSERT INTO public."PersonalTransaction" VALUES ('mf30ca72228d54c856af6eb', 'dev0000000000000000000001', 2025, 1, 16, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.784');
INSERT INTO public."PersonalTransaction" VALUES ('m007c461def7d4b026ec1de', 'dev0000000000000000000001', 2025, 1, 35, 'EXPENSE', 'md08e71f5d60a83d7e21d53', NULL, NULL, '2026-05-11 14:09:39.784');
INSERT INTO public."PersonalTransaction" VALUES ('md744a19ccd7ab68ef58ded', 'dev0000000000000000000001', 2025, 1, 33, 'EXPENSE', 'm1d61306d4477169ab0f25d', NULL, NULL, '2026-05-11 14:09:39.784');
INSERT INTO public."PersonalTransaction" VALUES ('mf2973e5690ab1dd6d5244a', 'dev0000000000000000000001', 2025, 1, 400, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.784');
INSERT INTO public."PersonalTransaction" VALUES ('m1edfd83bcbc7957ff7fe95', 'dev0000000000000000000001', 2025, 1, 250, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.785');
INSERT INTO public."PersonalTransaction" VALUES ('maf4c3675cb2da2b9e7d11f', 'dev0000000000000000000001', 2025, 1, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.785');
INSERT INTO public."PersonalTransaction" VALUES ('m22217d8bafde0f9ec9b70b', 'dev0000000000000000000001', 2025, 1, 435, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.785');
INSERT INTO public."PersonalTransaction" VALUES ('mdf44881cd0d5799dbec491', 'dev0000000000000000000001', 2025, 2, 2200, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.785');
INSERT INTO public."PersonalTransaction" VALUES ('m75c5e0e0a92c820115e375', 'dev0000000000000000000001', 2025, 2, 351, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.786');
INSERT INTO public."PersonalTransaction" VALUES ('m1a082c2eda0366ab50c9be', 'dev0000000000000000000001', 2025, 2, 82, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.786');
INSERT INTO public."PersonalTransaction" VALUES ('m0d745c9c8ff21697d98221', 'dev0000000000000000000001', 2025, 2, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.786');
INSERT INTO public."PersonalTransaction" VALUES ('m973f465cfa84539abcdfa1', 'dev0000000000000000000001', 2025, 2, 118, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.786');
INSERT INTO public."PersonalTransaction" VALUES ('md3e7338f2b0f8ee271b0f9', 'dev0000000000000000000001', 2025, 2, 36, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.786');
INSERT INTO public."PersonalTransaction" VALUES ('m47512fc61733911e693e04', 'dev0000000000000000000001', 2025, 2, 400, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.787');
INSERT INTO public."PersonalTransaction" VALUES ('m92edb5b9ff5b96da1876aa', 'dev0000000000000000000001', 2025, 2, 250, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.787');
INSERT INTO public."PersonalTransaction" VALUES ('ma5ffaee81c339b0c519a03', 'dev0000000000000000000001', 2025, 2, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.787');
INSERT INTO public."PersonalTransaction" VALUES ('m840e1332d96409f3635b45', 'dev0000000000000000000001', 2025, 2, 519, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.787');
INSERT INTO public."PersonalTransaction" VALUES ('m55a368d65661a15735c38a', 'dev0000000000000000000001', 2025, 3, 2200, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.788');
INSERT INTO public."PersonalTransaction" VALUES ('m18f6302c26a266cb29b8de', 'dev0000000000000000000001', 2025, 3, 243, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.788');
INSERT INTO public."PersonalTransaction" VALUES ('m54a4ec06642c563236a585', 'dev0000000000000000000001', 2025, 3, 80, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.788');
INSERT INTO public."PersonalTransaction" VALUES ('m5c74e88deb7578179f55fc', 'dev0000000000000000000001', 2025, 3, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.788');
INSERT INTO public."PersonalTransaction" VALUES ('mce293e2d905637d1a00959', 'dev0000000000000000000001', 2025, 3, 168, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.789');
INSERT INTO public."PersonalTransaction" VALUES ('m5a71665fce99978c36a13a', 'dev0000000000000000000001', 2025, 3, 37, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.789');
INSERT INTO public."PersonalTransaction" VALUES ('m64317f6cdc1ae96b516e16', 'dev0000000000000000000001', 2025, 3, 125, 'EXPENSE', 'm1d61306d4477169ab0f25d', NULL, NULL, '2026-05-11 14:09:39.789');
INSERT INTO public."PersonalTransaction" VALUES ('m274a144c783d98bbc5e736', 'dev0000000000000000000001', 2025, 3, 400, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.789');
INSERT INTO public."PersonalTransaction" VALUES ('m338f4ac0250ad6a402c92a', 'dev0000000000000000000001', 2025, 3, 250, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.79');
INSERT INTO public."PersonalTransaction" VALUES ('m3de3ced5f3df3ca7d10f27', 'dev0000000000000000000001', 2025, 3, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.79');
INSERT INTO public."PersonalTransaction" VALUES ('mf007f973113ddf6a7daa94', 'dev0000000000000000000001', 2025, 4, 2200, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.79');
INSERT INTO public."PersonalTransaction" VALUES ('m4d2113767293aee2419b99', 'dev0000000000000000000001', 2025, 4, 225, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.791');
INSERT INTO public."PersonalTransaction" VALUES ('maa81ff971cf0ac08354f93', 'dev0000000000000000000001', 2025, 4, 135, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.791');
INSERT INTO public."PersonalTransaction" VALUES ('m91820fab1db6cf5c4cb32d', 'dev0000000000000000000001', 2025, 4, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.791');
INSERT INTO public."PersonalTransaction" VALUES ('m2c2498c6e00204d21899cd', 'dev0000000000000000000001', 2025, 4, 154, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.791');
INSERT INTO public."PersonalTransaction" VALUES ('m2e82c6da2bb49bdaf110df', 'dev0000000000000000000001', 2025, 4, 47, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.791');
INSERT INTO public."PersonalTransaction" VALUES ('m7f5c44c7681088cded55a6', 'dev0000000000000000000001', 2025, 4, 50, 'EXPENSE', 'md08e71f5d60a83d7e21d53', NULL, NULL, '2026-05-11 14:09:39.792');
INSERT INTO public."PersonalTransaction" VALUES ('m4279b9617fcef7ed819f42', 'dev0000000000000000000001', 2025, 4, 400, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.792');
INSERT INTO public."PersonalTransaction" VALUES ('m210c17f08d29b3ec169ef1', 'dev0000000000000000000001', 2025, 4, 250, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.792');
INSERT INTO public."PersonalTransaction" VALUES ('mc39c796f6eae01ce3b4e62', 'dev0000000000000000000001', 2025, 4, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.793');
INSERT INTO public."PersonalTransaction" VALUES ('m467572cf34f94a09d85d36', 'dev0000000000000000000001', 2025, 4, 452, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.793');
INSERT INTO public."PersonalTransaction" VALUES ('ma3831fe5a02b0f993fb27d', 'dev0000000000000000000001', 2025, 5, 2474, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.793');
INSERT INTO public."PersonalTransaction" VALUES ('mabd54beca1b82dd7b69533', 'dev0000000000000000000001', 2025, 5, 234, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.793');
INSERT INTO public."PersonalTransaction" VALUES ('m659389860e3e6323474eec', 'dev0000000000000000000001', 2025, 5, 113, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.793');
INSERT INTO public."PersonalTransaction" VALUES ('m94f93bdeeaba42e2b1b997', 'dev0000000000000000000001', 2025, 5, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.794');
INSERT INTO public."PersonalTransaction" VALUES ('m24454abe08edf4b62c3ee3', 'dev0000000000000000000001', 2025, 5, 174, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.794');
INSERT INTO public."PersonalTransaction" VALUES ('mb6f375a87120aeb37e1ba8', 'dev0000000000000000000001', 2025, 5, 28, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.794');
INSERT INTO public."PersonalTransaction" VALUES ('mfe253c09507ce3ceb24a9d', 'dev0000000000000000000001', 2025, 5, 400, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.794');
INSERT INTO public."PersonalTransaction" VALUES ('m01cbb1d01430209b392052', 'dev0000000000000000000001', 2025, 5, 250, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.795');
INSERT INTO public."PersonalTransaction" VALUES ('mbe8689d8cb368052011aef', 'dev0000000000000000000001', 2025, 5, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.795');
INSERT INTO public."PersonalTransaction" VALUES ('m6775b9bb60cab78556caca', 'dev0000000000000000000001', 2025, 6, 2474, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.795');
INSERT INTO public."PersonalTransaction" VALUES ('m25ebcb3edf2d73d18f201b', 'dev0000000000000000000001', 2025, 6, 262, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.795');
INSERT INTO public."PersonalTransaction" VALUES ('m7afe67a5b2366c094b59a7', 'dev0000000000000000000001', 2025, 6, 85, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.795');
INSERT INTO public."PersonalTransaction" VALUES ('mba75c26e2d861c9386bfda', 'dev0000000000000000000001', 2025, 6, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.796');
INSERT INTO public."PersonalTransaction" VALUES ('mcbfdfbe29f5a36e51b9e34', 'dev0000000000000000000001', 2025, 6, 110, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.796');
INSERT INTO public."PersonalTransaction" VALUES ('m4f735e430b3a05ac2a6e19', 'dev0000000000000000000001', 2025, 6, 33, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.796');
INSERT INTO public."PersonalTransaction" VALUES ('mf512c17437657d49d3a0c7', 'dev0000000000000000000001', 2025, 6, 400, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.796');
INSERT INTO public."PersonalTransaction" VALUES ('m60c6fe33b2a78f1d34cd08', 'dev0000000000000000000001', 2025, 6, 250, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.797');
INSERT INTO public."PersonalTransaction" VALUES ('mfbf88be7b9a92af3a7360d', 'dev0000000000000000000001', 2025, 6, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.797');
INSERT INTO public."PersonalTransaction" VALUES ('mad92d1c86ed0851fd00dce', 'dev0000000000000000000001', 2025, 6, 340, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.797');
INSERT INTO public."PersonalTransaction" VALUES ('m174be9305a6b75f14acf1e', 'dev0000000000000000000001', 2025, 7, 2474, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.797');
INSERT INTO public."PersonalTransaction" VALUES ('m79f32b3a12abd47b38b31a', 'dev0000000000000000000001', 2025, 7, 350, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.798');
INSERT INTO public."PersonalTransaction" VALUES ('m796690e9dc8da6a11d824e', 'dev0000000000000000000001', 2025, 7, 89, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.798');
INSERT INTO public."PersonalTransaction" VALUES ('md6681731a16102a4b823d2', 'dev0000000000000000000001', 2025, 7, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.798');
INSERT INTO public."PersonalTransaction" VALUES ('m39e7cddca72409a5faffd4', 'dev0000000000000000000001', 2025, 7, 149, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.798');
INSERT INTO public."PersonalTransaction" VALUES ('m8a66e1fc23e0c72dc1d607', 'dev0000000000000000000001', 2025, 7, 28, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.799');
INSERT INTO public."PersonalTransaction" VALUES ('m2e33f46652e97610c21ae7', 'dev0000000000000000000001', 2025, 7, 93, 'EXPENSE', 'md08e71f5d60a83d7e21d53', NULL, NULL, '2026-05-11 14:09:39.799');
INSERT INTO public."PersonalTransaction" VALUES ('mfd1dab4a13765a6bd40eea', 'dev0000000000000000000001', 2025, 7, 111, 'EXPENSE', 'm1d61306d4477169ab0f25d', NULL, NULL, '2026-05-11 14:09:39.799');
INSERT INTO public."PersonalTransaction" VALUES ('m05610360ed5b75cb696d03', 'dev0000000000000000000001', 2025, 7, 400, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.799');
INSERT INTO public."PersonalTransaction" VALUES ('mc076e8d8b28cbc93bbe1b9', 'dev0000000000000000000001', 2025, 7, 250, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.799');
INSERT INTO public."PersonalTransaction" VALUES ('m469c3e319fe56898ce26d4', 'dev0000000000000000000001', 2025, 7, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.8');
INSERT INTO public."PersonalTransaction" VALUES ('m01ae73b6f69a3be39862da', 'dev0000000000000000000001', 2025, 8, 2474, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.8');
INSERT INTO public."PersonalTransaction" VALUES ('m57845f7731fbeeccaf0acd', 'dev0000000000000000000001', 2025, 8, 315, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.8');
INSERT INTO public."PersonalTransaction" VALUES ('mdc22e91763cde9624a612e', 'dev0000000000000000000001', 2025, 8, 97, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.8');
INSERT INTO public."PersonalTransaction" VALUES ('m27c7e0e1bcf4ac2e8bfa20', 'dev0000000000000000000001', 2025, 8, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.801');
INSERT INTO public."PersonalTransaction" VALUES ('m14b45e31ce6f1a09d7e7e7', 'dev0000000000000000000001', 2025, 8, 169, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.801');
INSERT INTO public."PersonalTransaction" VALUES ('m22fdd66b9b3ef2a53482b6', 'dev0000000000000000000001', 2025, 8, 52, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.801');
INSERT INTO public."PersonalTransaction" VALUES ('m182e0f63af90b3e12dc6ee', 'dev0000000000000000000001', 2025, 8, 400, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.801');
INSERT INTO public."PersonalTransaction" VALUES ('m077b7d9bde6e928b6933c6', 'dev0000000000000000000001', 2025, 8, 250, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.802');
INSERT INTO public."PersonalTransaction" VALUES ('m96017d85f225315e859224', 'dev0000000000000000000001', 2025, 8, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.802');
INSERT INTO public."PersonalTransaction" VALUES ('m5520f183c1a883b3bdc263', 'dev0000000000000000000001', 2025, 8, 394, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.802');
INSERT INTO public."PersonalTransaction" VALUES ('m2c4d8b05bd7b0974caaebe', 'dev0000000000000000000001', 2025, 9, 2474, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.802');
INSERT INTO public."PersonalTransaction" VALUES ('m47637809a4469386f5ae73', 'dev0000000000000000000001', 2025, 9, 246, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.803');
INSERT INTO public."PersonalTransaction" VALUES ('mcc75aded720aec8ecbb8f9', 'dev0000000000000000000001', 2025, 9, 102, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.803');
INSERT INTO public."PersonalTransaction" VALUES ('m34c82b3d642c731a46c29d', 'dev0000000000000000000001', 2025, 9, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.803');
INSERT INTO public."PersonalTransaction" VALUES ('m6a03ba312e04ab9f1b6333', 'dev0000000000000000000001', 2025, 9, 93, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.803');
INSERT INTO public."PersonalTransaction" VALUES ('mef660482c962b9d61db137', 'dev0000000000000000000001', 2025, 9, 33, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.803');
INSERT INTO public."PersonalTransaction" VALUES ('m53974e7fe64ebe9462d177', 'dev0000000000000000000001', 2025, 9, 83, 'EXPENSE', 'm1d61306d4477169ab0f25d', NULL, NULL, '2026-05-11 14:09:39.804');
INSERT INTO public."PersonalTransaction" VALUES ('m742672f61caf5698583806', 'dev0000000000000000000001', 2025, 9, 400, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.804');
INSERT INTO public."PersonalTransaction" VALUES ('me229b25ae32f5dc0d63c7e', 'dev0000000000000000000001', 2025, 9, 250, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.804');
INSERT INTO public."PersonalTransaction" VALUES ('m4ca52fa25532862aada4e3', 'dev0000000000000000000001', 2025, 9, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.805');
INSERT INTO public."PersonalTransaction" VALUES ('m0dab8b35873b86faab40c7', 'dev0000000000000000000001', 2025, 9, 420, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.805');
INSERT INTO public."PersonalTransaction" VALUES ('mc41d4c33ac5771dcf3897b', 'dev0000000000000000000001', 2025, 10, 2474, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.805');
INSERT INTO public."PersonalTransaction" VALUES ('mcc2c29b8d989561d978ea0', 'dev0000000000000000000001', 2025, 10, 329, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.805');
INSERT INTO public."PersonalTransaction" VALUES ('m9aad00e554f6da292167a4', 'dev0000000000000000000001', 2025, 10, 93, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.806');
INSERT INTO public."PersonalTransaction" VALUES ('mfb460e178448c81c12d483', 'dev0000000000000000000001', 2025, 10, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.806');
INSERT INTO public."PersonalTransaction" VALUES ('mf9506e530ebf5b8a50eb6c', 'dev0000000000000000000001', 2025, 10, 147, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.806');
INSERT INTO public."PersonalTransaction" VALUES ('m93a68a663c343ea16a5d51', 'dev0000000000000000000001', 2025, 10, 13, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.806');
INSERT INTO public."PersonalTransaction" VALUES ('m8fb32135f4094e6ab50b19', 'dev0000000000000000000001', 2025, 10, 46, 'EXPENSE', 'md08e71f5d60a83d7e21d53', NULL, NULL, '2026-05-11 14:09:39.807');
INSERT INTO public."PersonalTransaction" VALUES ('m722964f243a5cb43deb40d', 'dev0000000000000000000001', 2025, 10, 400, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.807');
INSERT INTO public."PersonalTransaction" VALUES ('me39574800cda2d020eb66b', 'dev0000000000000000000001', 2025, 10, 250, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.807');
INSERT INTO public."PersonalTransaction" VALUES ('mee6ed0b904b2a844a7f3c8', 'dev0000000000000000000001', 2025, 10, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.807');
INSERT INTO public."PersonalTransaction" VALUES ('m5a749f047a179959da85c9', 'dev0000000000000000000001', 2025, 10, 507, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.807');
INSERT INTO public."PersonalTransaction" VALUES ('m78295ba312e95d0b99abc9', 'dev0000000000000000000001', 2025, 11, 2474, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.808');
INSERT INTO public."PersonalTransaction" VALUES ('m276795363ec59a43e3d756', 'dev0000000000000000000001', 2025, 11, 298, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.808');
INSERT INTO public."PersonalTransaction" VALUES ('m3feb1bac2d217a6dfd0e2d', 'dev0000000000000000000001', 2025, 11, 108, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.808');
INSERT INTO public."PersonalTransaction" VALUES ('m25691b465d02d09b100448', 'dev0000000000000000000001', 2025, 11, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.808');
INSERT INTO public."PersonalTransaction" VALUES ('m85a09e9011fd1ca1869a58', 'dev0000000000000000000001', 2025, 11, 154, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.809');
INSERT INTO public."PersonalTransaction" VALUES ('m3dbf350e1035ea46e4b08a', 'dev0000000000000000000001', 2025, 11, 65, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.809');
INSERT INTO public."PersonalTransaction" VALUES ('m969d119970168a0349939e', 'dev0000000000000000000001', 2025, 11, 73, 'EXPENSE', 'm1d61306d4477169ab0f25d', NULL, NULL, '2026-05-11 14:09:39.809');
INSERT INTO public."PersonalTransaction" VALUES ('m4e6d10c9e0985500099630', 'dev0000000000000000000001', 2025, 11, 400, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.809');
INSERT INTO public."PersonalTransaction" VALUES ('med884dc1f1bce56c67df40', 'dev0000000000000000000001', 2025, 11, 250, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.81');
INSERT INTO public."PersonalTransaction" VALUES ('m6622ebeeaea15f5a656261', 'dev0000000000000000000001', 2025, 11, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.81');
INSERT INTO public."PersonalTransaction" VALUES ('mb730bfcc8b4bbc970f944a', 'dev0000000000000000000001', 2025, 12, 2474, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.81');
INSERT INTO public."PersonalTransaction" VALUES ('m35133c72b8c581eb5b63be', 'dev0000000000000000000001', 2025, 12, 231, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.81');
INSERT INTO public."PersonalTransaction" VALUES ('m775d795345b936793673dd', 'dev0000000000000000000001', 2025, 12, 131, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.811');
INSERT INTO public."PersonalTransaction" VALUES ('mbe1eefe0a59f80420c61db', 'dev0000000000000000000001', 2025, 12, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.811');
INSERT INTO public."PersonalTransaction" VALUES ('m74781ad6acd588e9df44e7', 'dev0000000000000000000001', 2025, 12, 183, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.811');
INSERT INTO public."PersonalTransaction" VALUES ('m63ad1eebe3e11a0c67ad69', 'dev0000000000000000000001', 2025, 12, 41, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.811');
INSERT INTO public."PersonalTransaction" VALUES ('m8f23ff86bb834bae53ba72', 'dev0000000000000000000001', 2025, 12, 400, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.811');
INSERT INTO public."PersonalTransaction" VALUES ('m3e940a6d1c764ac240f60a', 'dev0000000000000000000001', 2025, 12, 250, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.812');
INSERT INTO public."PersonalTransaction" VALUES ('m3c7f63b8f2ecc8efde5bd2', 'dev0000000000000000000001', 2025, 12, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.812');
INSERT INTO public."PersonalTransaction" VALUES ('mb17a1cce5055bbbdb89b88', 'dev0000000000000000000001', 2025, 12, 311, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.812');
INSERT INTO public."PersonalTransaction" VALUES ('m33fb8b50b98c9b15c66291', 'dev0000000000000000000001', 2026, 1, 2600, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.812');
INSERT INTO public."PersonalTransaction" VALUES ('mbe4d9a014b6e19588a5e86', 'dev0000000000000000000001', 2026, 1, 235, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.813');
INSERT INTO public."PersonalTransaction" VALUES ('md184653c4929e4a6fe4f4b', 'dev0000000000000000000001', 2026, 1, 92, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.813');
INSERT INTO public."PersonalTransaction" VALUES ('mf411f3cc1441f7803a5e4a', 'dev0000000000000000000001', 2026, 1, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.813');
INSERT INTO public."PersonalTransaction" VALUES ('m87454d48adaace9a82b532', 'dev0000000000000000000001', 2026, 1, 183, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.813');
INSERT INTO public."PersonalTransaction" VALUES ('m5150b7d78088db4e2c5980', 'dev0000000000000000000001', 2026, 1, 51, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.814');
INSERT INTO public."PersonalTransaction" VALUES ('mb56e6c4a714a86f26c140a', 'dev0000000000000000000001', 2026, 1, 37, 'EXPENSE', 'md08e71f5d60a83d7e21d53', NULL, NULL, '2026-05-11 14:09:39.814');
INSERT INTO public."PersonalTransaction" VALUES ('maa471f2fee1944d194a8fb', 'dev0000000000000000000001', 2026, 1, 110, 'EXPENSE', 'm1d61306d4477169ab0f25d', NULL, NULL, '2026-05-11 14:09:39.814');
INSERT INTO public."PersonalTransaction" VALUES ('medecfb007042dd1e4ed216', 'dev0000000000000000000001', 2026, 1, 400, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.814');
INSERT INTO public."PersonalTransaction" VALUES ('mb774909b936bd704564fdf', 'dev0000000000000000000001', 2026, 1, 250, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.815');
INSERT INTO public."PersonalTransaction" VALUES ('mb4aac1c94ecdfbd9c12a09', 'dev0000000000000000000001', 2026, 1, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.815');
INSERT INTO public."PersonalTransaction" VALUES ('m8795af7d7491ea8517c4ec', 'dev0000000000000000000001', 2026, 1, 458, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.815');
INSERT INTO public."PersonalTransaction" VALUES ('m3987ab233a4289a4cd4ee5', 'dev0000000000000000000001', 2026, 2, 2600, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.815');
INSERT INTO public."PersonalTransaction" VALUES ('mbe0482d66743caa24a4eda', 'dev0000000000000000000001', 2026, 2, 328, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.816');
INSERT INTO public."PersonalTransaction" VALUES ('m1f086559554fa5a9d75614', 'dev0000000000000000000001', 2026, 2, 92, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.816');
INSERT INTO public."PersonalTransaction" VALUES ('m21bfa494b1db4eebebdcca', 'dev0000000000000000000001', 2026, 2, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.816');
INSERT INTO public."PersonalTransaction" VALUES ('mee082762f9a76c3ee2050f', 'dev0000000000000000000001', 2026, 2, 114, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.817');
INSERT INTO public."PersonalTransaction" VALUES ('m93bc072c498574c2695ad0', 'dev0000000000000000000001', 2026, 2, 22, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.817');
INSERT INTO public."PersonalTransaction" VALUES ('m07a610063e97354a172519', 'dev0000000000000000000001', 2026, 2, 400, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.817');
INSERT INTO public."PersonalTransaction" VALUES ('m81d1c26d87e4e0d38a0f1b', 'dev0000000000000000000001', 2026, 2, 250, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.817');
INSERT INTO public."PersonalTransaction" VALUES ('mab2ed9fe5597afe5a00533', 'dev0000000000000000000001', 2026, 2, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.818');
INSERT INTO public."PersonalTransaction" VALUES ('m694979ad0f2ce131b8167f', 'dev0000000000000000000001', 2026, 2, 523, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.818');
INSERT INTO public."PersonalTransaction" VALUES ('m1a73657494c92a10b289bf', 'dev0000000000000000000001', 2026, 3, 2600, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.818');
INSERT INTO public."PersonalTransaction" VALUES ('mb317d70b8f51173c07603b', 'dev0000000000000000000001', 2026, 3, 229, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.818');
INSERT INTO public."PersonalTransaction" VALUES ('m077ca371d210aa1600562a', 'dev0000000000000000000001', 2026, 3, 81, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.818');
INSERT INTO public."PersonalTransaction" VALUES ('m191da8741e3afbbdfef4ca', 'dev0000000000000000000001', 2026, 3, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.819');
INSERT INTO public."PersonalTransaction" VALUES ('mbbea39be170b45b6f47d21', 'dev0000000000000000000001', 2026, 3, 133, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.819');
INSERT INTO public."PersonalTransaction" VALUES ('m1dad129c27cfafd47c2f97', 'dev0000000000000000000001', 2026, 3, 20, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.819');
INSERT INTO public."PersonalTransaction" VALUES ('mecc54a4d49042946a6b37c', 'dev0000000000000000000001', 2026, 3, 48, 'EXPENSE', 'm1d61306d4477169ab0f25d', NULL, NULL, '2026-05-11 14:09:39.819');
INSERT INTO public."PersonalTransaction" VALUES ('m3a790802c87af949b17d75', 'dev0000000000000000000001', 2026, 3, 400, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.82');
INSERT INTO public."PersonalTransaction" VALUES ('m16ebf65670f0ffe12b4295', 'dev0000000000000000000001', 2026, 3, 250, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.82');
INSERT INTO public."PersonalTransaction" VALUES ('m517c8a02bc128339c9911c', 'dev0000000000000000000001', 2026, 3, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.82');
INSERT INTO public."PersonalTransaction" VALUES ('m937b3f561dc0e87ba1daee', 'dev0000000000000000000001', 2026, 4, 2600, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.82');
INSERT INTO public."PersonalTransaction" VALUES ('me243493d3b33438c9993a5', 'dev0000000000000000000001', 2026, 4, 266, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.821');
INSERT INTO public."PersonalTransaction" VALUES ('m7d90664107182a57e75c30', 'dev0000000000000000000001', 2026, 4, 92, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.821');
INSERT INTO public."PersonalTransaction" VALUES ('m801eab26fabfb613f7fbe3', 'dev0000000000000000000001', 2026, 4, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.821');
INSERT INTO public."PersonalTransaction" VALUES ('m9f670fcabd647f53ef5e1a', 'dev0000000000000000000001', 2026, 4, 88, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.821');
INSERT INTO public."PersonalTransaction" VALUES ('m2f4f0673e1cb0153a34af8', 'dev0000000000000000000001', 2026, 4, 11, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.822');
INSERT INTO public."PersonalTransaction" VALUES ('me63d9a67cc16972ef23f9f', 'dev0000000000000000000001', 2026, 4, 72, 'EXPENSE', 'md08e71f5d60a83d7e21d53', NULL, NULL, '2026-05-11 14:09:39.822');
INSERT INTO public."PersonalTransaction" VALUES ('m21f9ecb1a30dc2e0cc9033', 'dev0000000000000000000001', 2026, 4, 400, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.822');
INSERT INTO public."PersonalTransaction" VALUES ('m7532ac3aedf159d3e08d17', 'dev0000000000000000000001', 2026, 4, 250, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.822');
INSERT INTO public."PersonalTransaction" VALUES ('mf084e0740b87667e15c156', 'dev0000000000000000000001', 2026, 4, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.823');
INSERT INTO public."PersonalTransaction" VALUES ('mf40cf6190077705b73bd77', 'dev0000000000000000000001', 2026, 4, 480, 'TRANSFER', NULL, 'm4e0f51aa0cdc728c117a31', 'Traspaso a ahorro', '2026-05-11 14:09:39.823');
INSERT INTO public."PersonalTransaction" VALUES ('m49ed9f79b8aa720c24e5a7', 'dev0000000000000000000001', 2026, 5, 2600, 'INCOME', 'm3a44e485973d56b6082ab3', NULL, NULL, '2026-05-11 14:09:39.823');
INSERT INTO public."PersonalTransaction" VALUES ('me1d942d43be92f553334eb', 'dev0000000000000000000001', 2026, 5, 263, 'EXPENSE', 'mf5a1f55eab4119953f92bd', NULL, NULL, '2026-05-11 14:09:39.823');
INSERT INTO public."PersonalTransaction" VALUES ('m2b936cd3e5ed7514f98a31', 'dev0000000000000000000001', 2026, 5, 83, 'EXPENSE', 'm45aa650e8a78cd0dc3690c', NULL, NULL, '2026-05-11 14:09:39.824');
INSERT INTO public."PersonalTransaction" VALUES ('m60d3bacd4e1073e42d6e74', 'dev0000000000000000000001', 2026, 5, 35, 'EXPENSE', 'm8fd0e4965b97a856d0f239', NULL, 'Netflix, Spotify, etc.', '2026-05-11 14:09:39.824');
INSERT INTO public."PersonalTransaction" VALUES ('md524f77590ead89bc70d5d', 'dev0000000000000000000001', 2026, 5, 148, 'EXPENSE', 'm473083ea17352b0e680190', NULL, NULL, '2026-05-11 14:09:39.824');
INSERT INTO public."PersonalTransaction" VALUES ('m3bb9d07f81ecfa7be3d22a', 'dev0000000000000000000001', 2026, 5, 49, 'EXPENSE', 'm119b7caee854e8a14f1b9f', NULL, NULL, '2026-05-11 14:09:39.824');
INSERT INTO public."PersonalTransaction" VALUES ('mf74d1414133c5ab6d7082b', 'dev0000000000000000000001', 2026, 5, 400, 'TRANSFER', NULL, 'me6cefe44ec88c140416a1f', 'Aportación mensual ETF', '2026-05-11 14:09:39.825');
INSERT INTO public."PersonalTransaction" VALUES ('m938d432c020a0cfd5792e7', 'dev0000000000000000000001', 2026, 5, 250, 'TRANSFER', NULL, 'm33ddee004de3f46581d4f4', 'Aportación mensual S&P 500', '2026-05-11 14:09:39.825');
INSERT INTO public."PersonalTransaction" VALUES ('mf450a7c7128a35ecb3d405', 'dev0000000000000000000001', 2026, 5, 125, 'TRANSFER', NULL, 'm5e2fb61b7efab6c5a042b5', 'Aportación plan pensiones', '2026-05-11 14:09:39.825');


--
-- Data for Name: ProductSnapshot; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."ProductSnapshot" VALUES ('m1a69307b914f48d2d6d060', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 5000, '2023-01-01', '2026-05-11 14:09:39.63');
INSERT INTO public."ProductSnapshot" VALUES ('m7eefad6d96306c10db9dcd', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 5354.89, '2023-02-01', '2026-05-11 14:09:39.631');
INSERT INTO public."ProductSnapshot" VALUES ('md1f6ef63d57206506352c2', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 5713.68, '2023-03-01', '2026-05-11 14:09:39.631');
INSERT INTO public."ProductSnapshot" VALUES ('m50e69486d69ba9832a544b', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 6076.41, '2023-04-01', '2026-05-11 14:09:39.632');
INSERT INTO public."ProductSnapshot" VALUES ('ma95659b96dcd8211edb996', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 6443.13, '2023-05-01', '2026-05-11 14:09:39.632');
INSERT INTO public."ProductSnapshot" VALUES ('m9ff143e08112acedf81ed8', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 6813.86, '2023-06-01', '2026-05-11 14:09:39.633');
INSERT INTO public."ProductSnapshot" VALUES ('m48d828c7bf19b4f2deb6e2', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 7188.67, '2023-07-01', '2026-05-11 14:09:39.633');
INSERT INTO public."ProductSnapshot" VALUES ('m31e11d9ac11a82b7d4ef52', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 7567.6, '2023-08-01', '2026-05-11 14:09:39.634');
INSERT INTO public."ProductSnapshot" VALUES ('meba68bcb548689f24e022e', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 7950.68, '2023-09-01', '2026-05-11 14:09:39.634');
INSERT INTO public."ProductSnapshot" VALUES ('mfd002592bd25a005fd4324', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 8337.97, '2023-10-01', '2026-05-11 14:09:39.635');
INSERT INTO public."ProductSnapshot" VALUES ('m7cc31efefe86d4fa084837', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 8729.51, '2023-11-01', '2026-05-11 14:09:39.635');
INSERT INTO public."ProductSnapshot" VALUES ('m618e6bcce4e4bc3cb6f8aa', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 9125.35, '2023-12-01', '2026-05-11 14:09:39.635');
INSERT INTO public."ProductSnapshot" VALUES ('m2dd5af91e59ddefd736004', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 9525.54, '2024-01-01', '2026-05-11 14:09:39.636');
INSERT INTO public."ProductSnapshot" VALUES ('maa557aeedb4e238afcd701', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 9978.06, '2024-02-01', '2026-05-11 14:09:39.636');
INSERT INTO public."ProductSnapshot" VALUES ('m4b6dae439e5ddfcd20f924', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 10437.83, '2024-03-01', '2026-05-11 14:09:39.637');
INSERT INTO public."ProductSnapshot" VALUES ('m2840e40c2980afeb6b21b0', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 10904.95, '2024-04-01', '2026-05-11 14:09:39.637');
INSERT INTO public."ProductSnapshot" VALUES ('m24975192a8322aae297864', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 11379.56, '2024-05-01', '2026-05-11 14:09:39.637');
INSERT INTO public."ProductSnapshot" VALUES ('m0dd95bbabdff6b92fe48dd', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 11861.77, '2024-06-01', '2026-05-11 14:09:39.638');
INSERT INTO public."ProductSnapshot" VALUES ('m5f61a38947c5f5d706810a', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 12351.7, '2024-07-01', '2026-05-11 14:09:39.638');
INSERT INTO public."ProductSnapshot" VALUES ('madf4cf85e140c7d022ccd5', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 12849.47, '2024-08-01', '2026-05-11 14:09:39.639');
INSERT INTO public."ProductSnapshot" VALUES ('m43548ba6fe9ef19b60bf83', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 13355.22, '2024-09-01', '2026-05-11 14:09:39.639');
INSERT INTO public."ProductSnapshot" VALUES ('m9a0143276994332768f315', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 13869.06, '2024-10-01', '2026-05-11 14:09:39.639');
INSERT INTO public."ProductSnapshot" VALUES ('mf04eda6bfd82b3f99d5432', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 14391.13, '2024-11-01', '2026-05-11 14:09:39.64');
INSERT INTO public."ProductSnapshot" VALUES ('m1adf5b59a66664a3839bcf', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 14921.56, '2024-12-01', '2026-05-11 14:09:39.64');
INSERT INTO public."ProductSnapshot" VALUES ('m2247929797f6d677c0314f', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 15460.48, '2025-01-01', '2026-05-11 14:09:39.64');
INSERT INTO public."ProductSnapshot" VALUES ('m2438a078a260f43bd24b32', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 15883.76, '2025-02-01', '2026-05-11 14:09:39.641');
INSERT INTO public."ProductSnapshot" VALUES ('ma23baa7c8ed84109856009', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 16310.42, '2025-03-01', '2026-05-11 14:09:39.641');
INSERT INTO public."ProductSnapshot" VALUES ('ma384dcf68a3c5f28dba61f', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 16740.49, '2025-04-01', '2026-05-11 14:09:39.641');
INSERT INTO public."ProductSnapshot" VALUES ('m362bbeff37a4b5933f1fa2', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 17173.98, '2025-05-01', '2026-05-11 14:09:39.641');
INSERT INTO public."ProductSnapshot" VALUES ('m5580041531808b754949e7', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 17610.92, '2025-06-01', '2026-05-11 14:09:39.642');
INSERT INTO public."ProductSnapshot" VALUES ('ma363dec92cd2025789eee8', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 18051.36, '2025-07-01', '2026-05-11 14:09:39.642');
INSERT INTO public."ProductSnapshot" VALUES ('mbb8c71bd6956735324ac0d', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 18495.3, '2025-08-01', '2026-05-11 14:09:39.642');
INSERT INTO public."ProductSnapshot" VALUES ('m6e1072342835bf7ffc07cd', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 18942.78, '2025-09-01', '2026-05-11 14:09:39.643');
INSERT INTO public."ProductSnapshot" VALUES ('m34ab22b86ce39902495abd', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 19393.84, '2025-10-01', '2026-05-11 14:09:39.643');
INSERT INTO public."ProductSnapshot" VALUES ('m1144f988ee162be415966f', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 19848.49, '2025-11-01', '2026-05-11 14:09:39.643');
INSERT INTO public."ProductSnapshot" VALUES ('m75f90105ca1fb0839918e1', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 20306.76, '2025-12-01', '2026-05-11 14:09:39.644');
INSERT INTO public."ProductSnapshot" VALUES ('m9864fb490534b20d5997db', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 20768.69, '2026-01-01', '2026-05-11 14:09:39.644');
INSERT INTO public."ProductSnapshot" VALUES ('mcf11e7f605c7270ab04b91', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 21153.3, '2026-02-01', '2026-05-11 14:09:39.644');
INSERT INTO public."ProductSnapshot" VALUES ('m29feb02103695bcdb08621', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 21539.49, '2026-03-01', '2026-05-11 14:09:39.645');
INSERT INTO public."ProductSnapshot" VALUES ('m1df03bd35da3d0666c38c7', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 21927.24, '2026-04-01', '2026-05-11 14:09:39.645');
INSERT INTO public."ProductSnapshot" VALUES ('ma93fc43e60480320efe0dc', 'me6cefe44ec88c140416a1f', 'dev0000000000000000000001', 22316.57, '2026-05-01', '2026-05-11 14:09:39.645');
INSERT INTO public."ProductSnapshot" VALUES ('m621236381e3484bcf18107', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 400, '2023-03-01', '2026-05-11 14:09:39.646');
INSERT INTO public."ProductSnapshot" VALUES ('m9afabdc02018fa2153911b', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 604.09, '2023-04-01', '2026-05-11 14:09:39.646');
INSERT INTO public."ProductSnapshot" VALUES ('mf0e24b0e31481d012b6bcc', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 810.28, '2023-05-01', '2026-05-11 14:09:39.646');
INSERT INTO public."ProductSnapshot" VALUES ('m6298a2b004a3060eca4ca2', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 1018.57, '2023-06-01', '2026-05-11 14:09:39.647');
INSERT INTO public."ProductSnapshot" VALUES ('me2c6c5f3eab8fc612a9ae6', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 1229, '2023-07-01', '2026-05-11 14:09:39.647');
INSERT INTO public."ProductSnapshot" VALUES ('m9643ed9b1e38adbfc0dbc3', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 1441.58, '2023-08-01', '2026-05-11 14:09:39.647');
INSERT INTO public."ProductSnapshot" VALUES ('m8da4e9925c65fb8dd749dd', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 1656.34, '2023-09-01', '2026-05-11 14:09:39.648');
INSERT INTO public."ProductSnapshot" VALUES ('m85625eaa0feaac80108722', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 1873.29, '2023-10-01', '2026-05-11 14:09:39.648');
INSERT INTO public."ProductSnapshot" VALUES ('m9f942ba4af2941f3ab59ca', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 2092.47, '2023-11-01', '2026-05-11 14:09:39.649');
INSERT INTO public."ProductSnapshot" VALUES ('m2e0cbdfdff05dfdf67abf0', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 2313.89, '2023-12-01', '2026-05-11 14:09:39.649');
INSERT INTO public."ProductSnapshot" VALUES ('m37543cc4aa6bb566dd8ce7', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 2537.58, '2024-01-01', '2026-05-11 14:09:39.649');
INSERT INTO public."ProductSnapshot" VALUES ('m0b89df2ff949ec0c90dedc', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 2781.73, '2024-02-01', '2026-05-11 14:09:39.65');
INSERT INTO public."ProductSnapshot" VALUES ('m019681b3bd25c5f0600d57', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 3030.14, '2024-03-01', '2026-05-11 14:09:39.65');
INSERT INTO public."ProductSnapshot" VALUES ('m8acf3909cacd581ba9a977', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 3282.87, '2024-04-01', '2026-05-11 14:09:39.651');
INSERT INTO public."ProductSnapshot" VALUES ('m03d157b676f668fd9dc132', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 3539.99, '2024-05-01', '2026-05-11 14:09:39.651');
INSERT INTO public."ProductSnapshot" VALUES ('m1e9fc157b26308760973dd', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 3801.59, '2024-06-01', '2026-05-11 14:09:39.651');
INSERT INTO public."ProductSnapshot" VALUES ('mda6da197740d1a1ef05685', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 4067.74, '2024-07-01', '2026-05-11 14:09:39.652');
INSERT INTO public."ProductSnapshot" VALUES ('m8235e18cd12183e5250a88', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 4338.52, '2024-08-01', '2026-05-11 14:09:39.652');
INSERT INTO public."ProductSnapshot" VALUES ('me4ae4db7bcb47e7df75251', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 4614.02, '2024-09-01', '2026-05-11 14:09:39.652');
INSERT INTO public."ProductSnapshot" VALUES ('m19aad075cd320c7d62fd10', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 4894.3, '2024-10-01', '2026-05-11 14:09:39.653');
INSERT INTO public."ProductSnapshot" VALUES ('mf32fa49035d08716de1673', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 5179.47, '2024-11-01', '2026-05-11 14:09:39.653');
INSERT INTO public."ProductSnapshot" VALUES ('m3766b04e6448eafdf16421', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 5469.6, '2024-12-01', '2026-05-11 14:09:39.653');
INSERT INTO public."ProductSnapshot" VALUES ('m2576292e29f7d9f675ef53', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 5764.77, '2025-01-01', '2026-05-11 14:09:39.654');
INSERT INTO public."ProductSnapshot" VALUES ('mc8fd5ed04b3c6ad31a9a91', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 6006.32, '2025-02-01', '2026-05-11 14:09:39.654');
INSERT INTO public."ProductSnapshot" VALUES ('m80d13d11333209ca74e28d', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 6249.61, '2025-03-01', '2026-05-11 14:09:39.654');
INSERT INTO public."ProductSnapshot" VALUES ('m30d2a2d34a068369512282', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 6494.65, '2025-04-01', '2026-05-11 14:09:39.655');
INSERT INTO public."ProductSnapshot" VALUES ('m8c1c9dd9b7f6d6558a3a82', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 6741.46, '2025-05-01', '2026-05-11 14:09:39.655');
INSERT INTO public."ProductSnapshot" VALUES ('m681a0210cfd2dddeae95a9', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 6990.05, '2025-06-01', '2026-05-11 14:09:39.655');
INSERT INTO public."ProductSnapshot" VALUES ('mb1476108c5973c2e0b7b37', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 7240.43, '2025-07-01', '2026-05-11 14:09:39.656');
INSERT INTO public."ProductSnapshot" VALUES ('m54c1ac87832f4d868e6394', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 7492.61, '2025-08-01', '2026-05-11 14:09:39.656');
INSERT INTO public."ProductSnapshot" VALUES ('m81b605b79dbcdfa1e014d3', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 7746.61, '2025-09-01', '2026-05-11 14:09:39.656');
INSERT INTO public."ProductSnapshot" VALUES ('m937200b39856a1e424db5b', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 8002.45, '2025-10-01', '2026-05-11 14:09:39.657');
INSERT INTO public."ProductSnapshot" VALUES ('m8ec0b4d4f053cd1fb2d492', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 8260.12, '2025-11-01', '2026-05-11 14:09:39.657');
INSERT INTO public."ProductSnapshot" VALUES ('mb0c79a748d9a2823951a0c', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 8519.66, '2025-12-01', '2026-05-11 14:09:39.657');
INSERT INTO public."ProductSnapshot" VALUES ('mf6a042417bfcb8ec3eafa4', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 8781.06, '2026-01-01', '2026-05-11 14:09:39.658');
INSERT INTO public."ProductSnapshot" VALUES ('mb88708e9cfabc469c4f223', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 9009.81, '2026-02-01', '2026-05-11 14:09:39.658');
INSERT INTO public."ProductSnapshot" VALUES ('m945f538c4df66045bf81e4', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 9239.3, '2026-03-01', '2026-05-11 14:09:39.659');
INSERT INTO public."ProductSnapshot" VALUES ('m0e4b337466f372a89538ed', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 9469.55, '2026-04-01', '2026-05-11 14:09:39.659');
INSERT INTO public."ProductSnapshot" VALUES ('ma3e6ed310ceed87ac104be', 'm33ddee004de3f46581d4f4', 'dev0000000000000000000001', 9700.55, '2026-05-01', '2026-05-11 14:09:39.659');
INSERT INTO public."ProductSnapshot" VALUES ('m6baa410e790c4ff4b75e17', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 4252, '2023-01-01', '2026-05-11 14:09:39.66');
INSERT INTO public."ProductSnapshot" VALUES ('m110b4ac0bc52f5dc975c8a', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 4601.02, '2023-02-01', '2026-05-11 14:09:39.66');
INSERT INTO public."ProductSnapshot" VALUES ('m8ad4101b09f2f3c316531c', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 4608.62, '2023-03-01', '2026-05-11 14:09:39.66');
INSERT INTO public."ProductSnapshot" VALUES ('mea927277e6fc5fad16cb10', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 4882.23, '2023-04-01', '2026-05-11 14:09:39.661');
INSERT INTO public."ProductSnapshot" VALUES ('mfc27a927cf5fe549157b2c', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 4890.3, '2023-05-01', '2026-05-11 14:09:39.661');
INSERT INTO public."ProductSnapshot" VALUES ('m5678815bed40bbdb5edab5', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 5274.37, '2023-06-01', '2026-05-11 14:09:39.661');
INSERT INTO public."ProductSnapshot" VALUES ('mf5376d8e6d328ca3a88564', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 5283.08, '2023-07-01', '2026-05-11 14:09:39.662');
INSERT INTO public."ProductSnapshot" VALUES ('m62cb07d51693e4519fcdd0', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 5610.81, '2023-08-01', '2026-05-11 14:09:39.662');
INSERT INTO public."ProductSnapshot" VALUES ('mf46ae0144cff2c92630f2c', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 5841.08, '2023-09-01', '2026-05-11 14:09:39.662');
INSERT INTO public."ProductSnapshot" VALUES ('m15e6d79d578400a82e18ef', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 6131.72, '2023-10-01', '2026-05-11 14:09:39.663');
INSERT INTO public."ProductSnapshot" VALUES ('m448ec8849def5934ed030f', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 6141.85, '2023-11-01', '2026-05-11 14:09:39.663');
INSERT INTO public."ProductSnapshot" VALUES ('med4103f481f10bea11a415', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 6508.99, '2023-12-01', '2026-05-11 14:09:39.663');
INSERT INTO public."ProductSnapshot" VALUES ('mff1f380b6bf5192a2a5b38', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 6699.74, '2024-01-01', '2026-05-11 14:09:39.664');
INSERT INTO public."ProductSnapshot" VALUES ('m7dd223eb770a46d555e381', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 6871.27, '2024-02-01', '2026-05-11 14:09:39.664');
INSERT INTO public."ProductSnapshot" VALUES ('m5b2bd6c6b324bfcf8aa25b', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 6888.21, '2024-03-01', '2026-05-11 14:09:39.664');
INSERT INTO public."ProductSnapshot" VALUES ('mc7b029609e6cd09c36c830', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 7211.2, '2024-04-01', '2026-05-11 14:09:39.665');
INSERT INTO public."ProductSnapshot" VALUES ('mdd1fed0d2f931aa340881b', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 7228.99, '2024-05-01', '2026-05-11 14:09:39.665');
INSERT INTO public."ProductSnapshot" VALUES ('mc9a39d8c9deab1e251901a', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 7614.82, '2024-06-01', '2026-05-11 14:09:39.665');
INSERT INTO public."ProductSnapshot" VALUES ('m40f7241499a569686ab523', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 7633.6, '2024-07-01', '2026-05-11 14:09:39.665');
INSERT INTO public."ProductSnapshot" VALUES ('mbd3812ffe069cdd872014a', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 8031.42, '2024-08-01', '2026-05-11 14:09:39.666');
INSERT INTO public."ProductSnapshot" VALUES ('m96e18defae65b9ee432394', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 8297.23, '2024-09-01', '2026-05-11 14:09:39.666');
INSERT INTO public."ProductSnapshot" VALUES ('m502b683c224c2d7c70cb31', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 8553.69, '2024-10-01', '2026-05-11 14:09:39.666');
INSERT INTO public."ProductSnapshot" VALUES ('m03b43e36d5c9423096284e', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 8574.79, '2024-11-01', '2026-05-11 14:09:39.667');
INSERT INTO public."ProductSnapshot" VALUES ('m86257b546e0cf6f6554883', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 8790.94, '2024-12-01', '2026-05-11 14:09:39.667');
INSERT INTO public."ProductSnapshot" VALUES ('mcad38e84e45581646a9e13', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 8967.62, '2025-01-01', '2026-05-11 14:09:39.668');
INSERT INTO public."ProductSnapshot" VALUES ('m0f8067dc2c90f690b579a4', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 9295.09, '2025-02-01', '2026-05-11 14:09:39.668');
INSERT INTO public."ProductSnapshot" VALUES ('m20ac8f99b3d672d479ef16', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 9314.24, '2025-03-01', '2026-05-11 14:09:39.668');
INSERT INTO public."ProductSnapshot" VALUES ('m93d453cc7b818b90c78752', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 9494.42, '2025-04-01', '2026-05-11 14:09:39.669');
INSERT INTO public."ProductSnapshot" VALUES ('m9754b49637cdefd7fe00ce', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 9513.98, '2025-05-01', '2026-05-11 14:09:39.669');
INSERT INTO public."ProductSnapshot" VALUES ('me140a80a61ce7efc0e39b7', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 9966.58, '2025-06-01', '2026-05-11 14:09:39.669');
INSERT INTO public."ProductSnapshot" VALUES ('m749e0c258842f040e8f993', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 9987.11, '2025-07-01', '2026-05-11 14:09:39.67');
INSERT INTO public."ProductSnapshot" VALUES ('m51f6babcb95f8e806ef0b7', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 10358.68, '2025-08-01', '2026-05-11 14:09:39.67');
INSERT INTO public."ProductSnapshot" VALUES ('me3e324d3eb914c17603978', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 10576.01, '2025-09-01', '2026-05-11 14:09:39.67');
INSERT INTO public."ProductSnapshot" VALUES ('maf7b653b2c402ccc5a62ec', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 10905.8, '2025-10-01', '2026-05-11 14:09:39.671');
INSERT INTO public."ProductSnapshot" VALUES ('m26e8dfebbf360e794cde92', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 10928.26, '2025-11-01', '2026-05-11 14:09:39.671');
INSERT INTO public."ProductSnapshot" VALUES ('m7808de272fbb32ad36e20c', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 11381.77, '2025-12-01', '2026-05-11 14:09:39.672');
INSERT INTO public."ProductSnapshot" VALUES ('m4c92b77c608f3fb67d7e9c', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 11570.22, '2026-01-01', '2026-05-11 14:09:39.672');
INSERT INTO public."ProductSnapshot" VALUES ('m807e01da652e3790b86e7a', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 11893.33, '2026-02-01', '2026-05-11 14:09:39.672');
INSERT INTO public."ProductSnapshot" VALUES ('mb7db9b8af88d138b3d324c', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 11912.97, '2026-03-01', '2026-05-11 14:09:39.672');
INSERT INTO public."ProductSnapshot" VALUES ('mede5be72c9e529cf92503e', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 12113.65, '2026-04-01', '2026-05-11 14:09:39.673');
INSERT INTO public."ProductSnapshot" VALUES ('m18eda9eaaef794ec3923a2', 'm4e0f51aa0cdc728c117a31', 'dev0000000000000000000001', 12133.65, '2026-05-01', '2026-05-11 14:09:39.673');
INSERT INTO public."ProductSnapshot" VALUES ('m3768832dc81afe79c55a9e', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 9825, '2023-01-01', '2026-05-11 14:09:39.673');
INSERT INTO public."ProductSnapshot" VALUES ('m6eef916dc826d865f72cdb', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 10005.55, '2023-02-01', '2026-05-11 14:09:39.674');
INSERT INTO public."ProductSnapshot" VALUES ('m1eec5280969cb11eee9726', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 10187.12, '2023-03-01', '2026-05-11 14:09:39.674');
INSERT INTO public."ProductSnapshot" VALUES ('mf407cd850abf0fa51c51b5', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 10369.72, '2023-04-01', '2026-05-11 14:09:39.674');
INSERT INTO public."ProductSnapshot" VALUES ('m87fe47211965f2ba277b5f', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 10553.36, '2023-05-01', '2026-05-11 14:09:39.675');
INSERT INTO public."ProductSnapshot" VALUES ('me20f05afc43ffde35ee98a', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 10738.03, '2023-06-01', '2026-05-11 14:09:39.675');
INSERT INTO public."ProductSnapshot" VALUES ('m99f1ff2a86704d3219e123', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 10923.74, '2023-07-01', '2026-05-11 14:09:39.675');
INSERT INTO public."ProductSnapshot" VALUES ('m47480dc2df0969d7e6c12e', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 11110.51, '2023-08-01', '2026-05-11 14:09:39.676');
INSERT INTO public."ProductSnapshot" VALUES ('m23f71085d8d2131a8735ac', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 11298.33, '2023-09-01', '2026-05-11 14:09:39.676');
INSERT INTO public."ProductSnapshot" VALUES ('m5f5c396de8d3ce4ca5e5ac', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 11487.21, '2023-10-01', '2026-05-11 14:09:39.676');
INSERT INTO public."ProductSnapshot" VALUES ('mb793f3f125ee532cfbc69f', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 11677.16, '2023-11-01', '2026-05-11 14:09:39.677');
INSERT INTO public."ProductSnapshot" VALUES ('mbaebd2bd9f04a58a14aecf', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 11868.18, '2023-12-01', '2026-05-11 14:09:39.677');
INSERT INTO public."ProductSnapshot" VALUES ('me453657416b77e1243c77e', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 12060.29, '2024-01-01', '2026-05-11 14:09:39.678');
INSERT INTO public."ProductSnapshot" VALUES ('m75d5e203dd8acfd7280522', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 12281.46, '2024-02-01', '2026-05-11 14:09:39.678');
INSERT INTO public."ProductSnapshot" VALUES ('m3068361969541b245980f3', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 12504.39, '2024-03-01', '2026-05-11 14:09:39.679');
INSERT INTO public."ProductSnapshot" VALUES ('m8af960e09a65e939f8f165', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 12729.1, '2024-04-01', '2026-05-11 14:09:39.679');
INSERT INTO public."ProductSnapshot" VALUES ('m95c2e0f45ed721de6f0d5c', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 12955.61, '2024-05-01', '2026-05-11 14:09:39.679');
INSERT INTO public."ProductSnapshot" VALUES ('m1d3419db1f236a9020b9dd', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 13183.92, '2024-06-01', '2026-05-11 14:09:39.68');
INSERT INTO public."ProductSnapshot" VALUES ('m4ba353e700fc2219f8b15d', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 13414.05, '2024-07-01', '2026-05-11 14:09:39.68');
INSERT INTO public."ProductSnapshot" VALUES ('mc135e9097792d98cb6db37', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 13646.01, '2024-08-01', '2026-05-11 14:09:39.681');
INSERT INTO public."ProductSnapshot" VALUES ('m425fffa55a11d6d65bb914', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 13879.83, '2024-09-01', '2026-05-11 14:09:39.681');
INSERT INTO public."ProductSnapshot" VALUES ('m7806d5b6660325ee1eaa8a', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 14115.51, '2024-10-01', '2026-05-11 14:09:39.682');
INSERT INTO public."ProductSnapshot" VALUES ('m320889ca9632d454cb1859', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 14353.07, '2024-11-01', '2026-05-11 14:09:39.682');
INSERT INTO public."ProductSnapshot" VALUES ('meb59374ce87025c568a22e', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 14592.52, '2024-12-01', '2026-05-11 14:09:39.682');
INSERT INTO public."ProductSnapshot" VALUES ('m5461f8c6430636ec3c1efa', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 14833.88, '2025-01-01', '2026-05-11 14:09:39.683');
INSERT INTO public."ProductSnapshot" VALUES ('m00d08e386af3991b754e02', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 15042.76, '2025-02-01', '2026-05-11 14:09:39.683');
INSERT INTO public."ProductSnapshot" VALUES ('m7851db43ed2bf0b5f933ed', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 15252.81, '2025-03-01', '2026-05-11 14:09:39.683');
INSERT INTO public."ProductSnapshot" VALUES ('m8a9566fa6d66712be231a5', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 15464.05, '2025-04-01', '2026-05-11 14:09:39.684');
INSERT INTO public."ProductSnapshot" VALUES ('m72328d1a06f65cc6ec3f14', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 15676.49, '2025-05-01', '2026-05-11 14:09:39.684');
INSERT INTO public."ProductSnapshot" VALUES ('mbf4d53fd6ba8d41871adf8', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 15890.12, '2025-06-01', '2026-05-11 14:09:39.684');
INSERT INTO public."ProductSnapshot" VALUES ('m9972e126f0fdc492493ff8', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 16104.97, '2025-07-01', '2026-05-11 14:09:39.685');
INSERT INTO public."ProductSnapshot" VALUES ('m0b15b11fe64f4e96b78feb', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 16321.03, '2025-08-01', '2026-05-11 14:09:39.685');
INSERT INTO public."ProductSnapshot" VALUES ('m26e958cef84d2cf4f37222', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 16538.31, '2025-09-01', '2026-05-11 14:09:39.686');
INSERT INTO public."ProductSnapshot" VALUES ('me97b812173d0629c989cb6', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 16756.82, '2025-10-01', '2026-05-11 14:09:39.686');
INSERT INTO public."ProductSnapshot" VALUES ('m0325fb37375a7dfe785f86', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 16976.57, '2025-11-01', '2026-05-11 14:09:39.687');
INSERT INTO public."ProductSnapshot" VALUES ('m94bffb854a17b878ae1f06', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 17197.55, '2025-12-01', '2026-05-11 14:09:39.687');
INSERT INTO public."ProductSnapshot" VALUES ('mc4ee1dad7f4811b5b12855', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 17419.79, '2026-01-01', '2026-05-11 14:09:39.687');
INSERT INTO public."ProductSnapshot" VALUES ('ma9035a21bf0fa7cb651e7a', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 17601.82, '2026-02-01', '2026-05-11 14:09:39.687');
INSERT INTO public."ProductSnapshot" VALUES ('mdcb3c6a28d1bae84256bde', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 17784.44, '2026-03-01', '2026-05-11 14:09:39.688');
INSERT INTO public."ProductSnapshot" VALUES ('mc79e47ad5efcf8f67b9df4', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 17967.67, '2026-04-01', '2026-05-11 14:09:39.688');
INSERT INTO public."ProductSnapshot" VALUES ('mdd6da910941f3beab392cf', 'm5e2fb61b7efab6c5a042b5', 'dev0000000000000000000001', 18151.49, '2026-05-01', '2026-05-11 14:09:39.688');
INSERT INTO public."ProductSnapshot" VALUES ('ma3cf958b60917e4c4f9090', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 2000, '2022-11-01', '2026-05-11 14:09:39.689');
INSERT INTO public."ProductSnapshot" VALUES ('mf713e9c261c6ae0a79db60', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 1975, '2022-12-01', '2026-05-11 14:09:39.689');
INSERT INTO public."ProductSnapshot" VALUES ('ma3becf6581cf7439686a24', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 2437.5, '2023-01-01', '2026-05-11 14:09:39.689');
INSERT INTO public."ProductSnapshot" VALUES ('mbd64a294688582ca0e4bbf', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 2812.5, '2023-02-01', '2026-05-11 14:09:39.689');
INSERT INTO public."ProductSnapshot" VALUES ('m83193aafa50a403ea4801b', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 3000, '2023-03-01', '2026-05-11 14:09:39.69');
INSERT INTO public."ProductSnapshot" VALUES ('m0258decddee78602f94b82', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 3312.5, '2023-04-01', '2026-05-11 14:09:39.69');
INSERT INTO public."ProductSnapshot" VALUES ('me6dae4c9e81e30323d2a18', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 3000, '2023-05-01', '2026-05-11 14:09:39.691');
INSERT INTO public."ProductSnapshot" VALUES ('ma85fd5b68c9db78a68c9db', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 3062.5, '2023-06-01', '2026-05-11 14:09:39.691');
INSERT INTO public."ProductSnapshot" VALUES ('m6711833399fc23caa2c7b4', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 3850, '2023-07-01', '2026-05-11 14:09:39.691');
INSERT INTO public."ProductSnapshot" VALUES ('me7b065361e2d1244acfda6', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 3620.15, '2023-08-01', '2026-05-11 14:09:39.691');
INSERT INTO public."ProductSnapshot" VALUES ('m28dd62c2372a5ecf1ae92b', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 3462.13, '2023-09-01', '2026-05-11 14:09:39.692');
INSERT INTO public."ProductSnapshot" VALUES ('m6f523d6b16200dedda8fad', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 3964.93, '2023-10-01', '2026-05-11 14:09:39.692');
INSERT INTO public."ProductSnapshot" VALUES ('mf0fe54b81c6fd5a4e5871b', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 5769.4, '2023-11-01', '2026-05-11 14:09:39.692');
INSERT INTO public."ProductSnapshot" VALUES ('md94f6f07c0ff8f36fd6199', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 6707.8, '2023-12-01', '2026-05-11 14:09:39.693');
INSERT INTO public."ProductSnapshot" VALUES ('m5ff87fa1e4c3e18b874047', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 7211.75, '2024-01-01', '2026-05-11 14:09:39.693');
INSERT INTO public."ProductSnapshot" VALUES ('m9310a1f062c9b3282d8e32', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 8202.28, '2024-02-01', '2026-05-11 14:09:39.693');
INSERT INTO public."ProductSnapshot" VALUES ('m67c928cbef5f234db58363', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 10861.07, '2024-03-01', '2026-05-11 14:09:39.693');
INSERT INTO public."ProductSnapshot" VALUES ('m52a2c7ac21764387879bb8', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 9748.9, '2024-04-01', '2026-05-11 14:09:39.694');
INSERT INTO public."ProductSnapshot" VALUES ('mff83e955213479a4863e07', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 10113.83, '2024-05-01', '2026-05-11 14:09:39.694');
INSERT INTO public."ProductSnapshot" VALUES ('m513f3e5b51f3bf62649086', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 9609.88, '2024-06-01', '2026-05-11 14:09:39.694');
INSERT INTO public."ProductSnapshot" VALUES ('mfd20756c1f76af2aa12042', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 9801.03, '2024-07-01', '2026-05-11 14:09:39.694');
INSERT INTO public."ProductSnapshot" VALUES ('mc1b12a8fb46adf10fa0975', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 9227.57, '2024-08-01', '2026-05-11 14:09:39.695');
INSERT INTO public."ProductSnapshot" VALUES ('m510c2861a96fc5c1fa32f1', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 9088.55, '2024-09-01', '2026-05-11 14:09:39.695');
INSERT INTO public."ProductSnapshot" VALUES ('m509904104d68ad29e009cf', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 11787.61, '2024-10-01', '2026-05-11 14:09:39.695');
INSERT INTO public."ProductSnapshot" VALUES ('m75ab155d137b0fccfb278c', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 16028.76, '2024-11-01', '2026-05-11 14:09:39.696');
INSERT INTO public."ProductSnapshot" VALUES ('m67003bda5aa076a2c6985b', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 17761.06, '2024-12-01', '2026-05-11 14:09:39.696');
INSERT INTO public."ProductSnapshot" VALUES ('m17de7b4583f3cc28740cb4', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 18617.26, '2025-01-01', '2026-05-11 14:09:39.696');
INSERT INTO public."ProductSnapshot" VALUES ('m8c84fa52f5124eae28a162', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 15988.94, '2025-02-01', '2026-05-11 14:09:39.697');
INSERT INTO public."ProductSnapshot" VALUES ('mcb19bceae11e4b0f8487f6', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 15152.65, '2025-03-01', '2026-05-11 14:09:39.697');
INSERT INTO public."ProductSnapshot" VALUES ('maa1d75e19fbe6ea3a5d384', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 14435.84, '2025-04-01', '2026-05-11 14:09:39.697');
INSERT INTO public."ProductSnapshot" VALUES ('m8d3689c1f4d5226221db62', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 13619.47, '2025-05-01', '2026-05-11 14:09:39.697');
INSERT INTO public."ProductSnapshot" VALUES ('m6c2dbd9c2a523b1d4e0164', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 12584.07, '2025-06-01', '2026-05-11 14:09:39.698');
INSERT INTO public."ProductSnapshot" VALUES ('m6bf944ea24479d1fa4896a', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 12365.04, '2025-07-01', '2026-05-11 14:09:39.698');
INSERT INTO public."ProductSnapshot" VALUES ('mf688d392a1fac5503598b3', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 13002.21, '2025-08-01', '2026-05-11 14:09:39.698');
INSERT INTO public."ProductSnapshot" VALUES ('mcd010837d94fe2cbe91d61', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 11628.32, '2025-09-01', '2026-05-11 14:09:39.698');
INSERT INTO public."ProductSnapshot" VALUES ('m2cb3a6a9a9b2dff3eb5685', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 12564.16, '2025-10-01', '2026-05-11 14:09:39.699');
INSERT INTO public."ProductSnapshot" VALUES ('mb2b40205369c674e4c5923', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 13977.88, '2025-11-01', '2026-05-11 14:09:39.699');
INSERT INTO public."ProductSnapshot" VALUES ('m907b2cf1500f160cb69ba3', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 15590.71, '2025-12-01', '2026-05-11 14:09:39.699');
INSERT INTO public."ProductSnapshot" VALUES ('m879809cc65bc040f35c888', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 16407.08, '2026-01-01', '2026-05-11 14:09:39.7');
INSERT INTO public."ProductSnapshot" VALUES ('mbe64605cc8578d5d7fd8ed', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 14754.42, '2026-02-01', '2026-05-11 14:09:39.7');
INSERT INTO public."ProductSnapshot" VALUES ('mdd87dbbcdaee947b33d50e', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 14196.9, '2026-03-01', '2026-05-11 14:09:39.7');
INSERT INTO public."ProductSnapshot" VALUES ('mcda72abe37c9e1ebfefb54', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 14973.45, '2026-04-01', '2026-05-11 14:09:39.701');
INSERT INTO public."ProductSnapshot" VALUES ('m44da00eaa9d81a6481f034', 'mad4854c3b25440880d9765', 'dev0000000000000000000001', 15630.53, '2026-05-01', '2026-05-11 14:09:39.701');
INSERT INTO public."ProductSnapshot" VALUES ('m94e82efea6d7598988ee82', 'm455ef773ece2b7bdf514b7', 'dev0000000000000000000001', 3672, '2023-01-01', '2026-05-11 14:09:39.701');
INSERT INTO public."ProductSnapshot" VALUES ('m0278dfae4cfe4aeba35440', 'm455ef773ece2b7bdf514b7', 'dev0000000000000000000001', 2328, '2023-04-01', '2026-05-11 14:09:39.701');
INSERT INTO public."ProductSnapshot" VALUES ('m21ac25c93962dc9289347e', 'm455ef773ece2b7bdf514b7', 'dev0000000000000000000001', 4149, '2023-07-01', '2026-05-11 14:09:39.702');
INSERT INTO public."ProductSnapshot" VALUES ('m7d74e77b27210305b9d700', 'm455ef773ece2b7bdf514b7', 'dev0000000000000000000001', 3094, '2023-10-01', '2026-05-11 14:09:39.702');
INSERT INTO public."ProductSnapshot" VALUES ('mdd8448f446bedcf56bd184', 'm455ef773ece2b7bdf514b7', 'dev0000000000000000000001', 2512, '2024-01-01', '2026-05-11 14:09:39.702');
INSERT INTO public."ProductSnapshot" VALUES ('m97a2312b3c7c4cb499d823', 'm455ef773ece2b7bdf514b7', 'dev0000000000000000000001', 3596, '2024-04-01', '2026-05-11 14:09:39.702');
INSERT INTO public."ProductSnapshot" VALUES ('m094b08ca32795b1b876c69', 'm455ef773ece2b7bdf514b7', 'dev0000000000000000000001', 2531, '2024-07-01', '2026-05-11 14:09:39.703');
INSERT INTO public."ProductSnapshot" VALUES ('m55664986bd31f080e16fc9', 'm455ef773ece2b7bdf514b7', 'dev0000000000000000000001', 3414, '2024-10-01', '2026-05-11 14:09:39.703');
INSERT INTO public."ProductSnapshot" VALUES ('m3d70b81679028b56df6747', 'm455ef773ece2b7bdf514b7', 'dev0000000000000000000001', 4550, '2025-01-01', '2026-05-11 14:09:39.703');
INSERT INTO public."ProductSnapshot" VALUES ('ma3f4687633dfe682e712a6', 'm455ef773ece2b7bdf514b7', 'dev0000000000000000000001', 3372, '2025-04-01', '2026-05-11 14:09:39.703');
INSERT INTO public."ProductSnapshot" VALUES ('m47ac0d400b7f944ffdfa55', 'm455ef773ece2b7bdf514b7', 'dev0000000000000000000001', 2522, '2025-07-01', '2026-05-11 14:09:39.704');
INSERT INTO public."ProductSnapshot" VALUES ('ma0a3cb7d6fa6fee055b84a', 'm455ef773ece2b7bdf514b7', 'dev0000000000000000000001', 3324, '2025-10-01', '2026-05-11 14:09:39.704');
INSERT INTO public."ProductSnapshot" VALUES ('mbdf68010d786ce684fb8d6', 'm455ef773ece2b7bdf514b7', 'dev0000000000000000000001', 3775, '2026-01-01', '2026-05-11 14:09:39.704');
INSERT INTO public."ProductSnapshot" VALUES ('mb182015d0c71947c0e5e2c', 'm455ef773ece2b7bdf514b7', 'dev0000000000000000000001', 3637, '2026-04-01', '2026-05-11 14:09:39.705');


--
-- Data for Name: SharedCategory; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: SharedDeposit; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: SharedExpense; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: SharedPersonIncome; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: SharedYearConfig; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- PostgreSQL database dump complete
--


