-- ============================================================================
-- ZC Network — demo seed data (12 approved graduates from the design mockup).
-- Run AFTER schema.sql. These rows have user_id = NULL (no auth account) so they
-- populate the public directory immediately. Safe to delete in production.
-- ============================================================================

insert into public.profiles
  (full_name, email, major, major_short, school, started_year, grad_year,
   current_title, current_company, location, career_path, about, experiences,
   phone, linkedin, github, twitter, status, account_role)
values
  ('Youssef Hassan', 'youssef.hassan@zc.edu.eg', 'Communications & Information Eng.', 'CIE', 'School of Sciences & Engineering', 2017, 2021,
   'Software Engineer', 'Instabug', 'Cairo, EG', 'job',
   'Backend engineer drawn to distributed systems. I mentor juniors at ZC and tinker with open-source observability tools on weekends.',
   '[{"title":"Software Engineer","company":"Instabug","dates":"2021 — Present","desc":"Building crash-reporting SDKs used by 25k+ mobile apps."},{"title":"SWE Intern","company":"Vodafone Egypt","dates":"Summer 2020","desc":"Internal tooling for network-operations dashboards."}]'::jsonb,
   '+20 100 555 0142', 'youssef-hassan', 'yhassan', '@yousfhassan', 'approved', 'alumni'),

  ('Mariam Khaled', 'mariam.khaled@zc.edu.eg', 'Biomedical Sciences', 'BMS', 'School of Biotechnology', 2018, 2022,
   'PhD Candidate', 'TU Munich', 'Munich, DE', 'grad',
   'Researching neurodegenerative disease models. ZC gave me my first wet-lab — now I run my own experiments in Germany.',
   '[{"title":"Doctoral Researcher","company":"TU Munich","dates":"2022 — Present","desc":"Modelling protein aggregation in Alzheimer''s using iPSC-derived neurons."},{"title":"Research Assistant","company":"Zewail City","dates":"2021 — 2022","desc":"Tissue-engineering lab, focused on scaffold biocompatibility."}]'::jsonb,
   '+49 151 555 0199', 'mariam-khaled', 'mkhaled-bio', '@mariamk_bio', 'approved', 'alumni'),

  ('Omar Tarek', 'omar.tarek@zc.edu.eg', 'Nanotechnology & Nanoelectronics Eng.', 'NNE', 'School of Nanotechnology', 2016, 2020,
   'Co-founder & CTO', 'Veridian', 'Giza, EG', 'startup',
   'Building low-cost air-quality sensors for MENA cities. Hardware is hard; that''s why I love it.',
   '[{"title":"Co-founder & CTO","company":"Veridian","dates":"2021 — Present","desc":"Leading sensor hardware and firmware for an environmental-monitoring startup."},{"title":"R&D Engineer","company":"Si-Ware Systems","dates":"2020 — 2021","desc":"MEMS spectrometer characterisation and testing."}]'::jsonb,
   '+20 122 555 0177', 'omar-tarek', 'otarek', '@omar_builds', 'approved', 'alumni'),

  ('Salma Mostafa', 'salma.mostafa@zc.edu.eg', 'Renewable Energy Eng.', 'REE', 'School of Sciences & Engineering', 2019, 2023,
   'Energy Analyst', 'Siemens Energy', 'Cairo, EG', 'job',
   'Turning grid data into decisions. Passionate about the energy transition across North Africa.',
   '[{"title":"Energy Analyst","company":"Siemens Energy","dates":"2023 — Present","desc":"Modelling load forecasts and renewable-integration scenarios for utility clients."}]'::jsonb,
   '+20 111 555 0123', 'salma-mostafa', 'salmam', '@salma_energy', 'approved', 'alumni'),

  ('Ahmed Saeed', 'ahmed.saeed@zc.edu.eg', 'Communications & Information Eng.', 'CIE', 'School of Computational Sciences & AI', 2015, 2019,
   'Machine Learning Engineer', 'Google', 'Dublin, IE', 'job',
   'NLP for low-resource languages, including Arabic dialects. ZC senior project turned into a career.',
   '[{"title":"ML Engineer","company":"Google","dates":"2022 — Present","desc":"Multilingual language-model evaluation and data pipelines."},{"title":"Data Scientist","company":"Swvl","dates":"2019 — 2022","desc":"Demand forecasting for ride-pooling routes."}]'::jsonb,
   '+353 83 555 0188', 'ahmed-saeed-ml', 'asaeed', '@ahmedsaeed_ai', 'approved', 'alumni'),

  ('Habiba Adel', 'habiba.adel@zc.edu.eg', 'Materials Science & Eng.', 'MSE', 'School of Sciences & Engineering', 2018, 2022,
   'Research Assistant', 'KAUST', 'Thuwal, SA', 'grad',
   'Perovskite solar cells and a lot of patience. I write about materials science for non-scientists.',
   '[{"title":"Graduate Researcher","company":"KAUST","dates":"2022 — Present","desc":"Stability engineering of perovskite photovoltaic films."}]'::jsonb,
   '+966 50 555 0166', 'habiba-adel', 'habibaa', '@habiba_mse', 'approved', 'alumni'),

  ('Karim Fouad', 'karim.fouad@zc.edu.eg', 'Aerospace Engineering', 'AER', 'School of Sciences & Engineering', 2017, 2021,
   'Systems Engineer', 'Airbus', 'Toulouse, FR', 'job',
   'Flight-control systems by day, RC planes by weekend. ZC''s aero club set the trajectory.',
   '[{"title":"Systems Engineer","company":"Airbus","dates":"2022 — Present","desc":"Integration and verification of flight-control software."},{"title":"Graduate Trainee","company":"Airbus","dates":"2021 — 2022","desc":"Rotational program across avionics teams."}]'::jsonb,
   '+33 6 55 55 0144', 'karim-fouad', 'kfouad', '@karim_aero', 'approved', 'alumni'),

  ('Yara Sherif', 'yara.sherif@zc.edu.eg', 'Environmental Engineering', 'ENV', 'School of Sciences & Engineering', 2020, 2024,
   'Sustainability Consultant', 'Deloitte', 'Dubai, AE', 'job',
   'Helping companies measure what they actually emit. Numbers first, narratives second.',
   '[{"title":"Sustainability Consultant","company":"Deloitte","dates":"2024 — Present","desc":"Carbon accounting and ESG reporting for regional clients."}]'::jsonb,
   '+971 50 555 0133', 'yara-sherif', 'yaras', '@yara_climate', 'approved', 'alumni'),

  ('Mostafa Nabil', 'mostafa.nabil@zc.edu.eg', 'Communications & Information Eng.', 'CIE', 'School of Computational Sciences & AI', 2019, 2023,
   'Founder', 'Madar', 'Alexandria, EG', 'startup',
   'Building logistics software for Egyptian SMEs. Shipping beats perfect.',
   '[{"title":"Founder","company":"Madar","dates":"2023 — Present","desc":"Route-optimisation and fleet tooling for last-mile delivery."}]'::jsonb,
   '+20 109 555 0155', 'mostafa-nabil', 'mnabil', '@mostafa_madar', 'approved', 'alumni'),

  ('Farida Magdy', 'farida.magdy@zc.edu.eg', 'Biomedical Sciences', 'BMS', 'School of Biotechnology', 2016, 2020,
   'Medical Data Scientist', 'Vodafone Health', 'Cairo, EG', 'job',
   'Where biology meets data. I build models that help clinicians triage faster.',
   '[{"title":"Medical Data Scientist","company":"Vodafone Health","dates":"2021 — Present","desc":"Predictive triage models from electronic health records."},{"title":"Research Intern","company":"57357 Hospital","dates":"2020 — 2021","desc":"Pediatric oncology data analysis."}]'::jsonb,
   '+20 100 555 0111', 'farida-magdy', 'faridam', '@farida_data', 'approved', 'alumni'),

  ('Tarek Sami', 'tarek.sami@zc.edu.eg', 'Nanotechnology & Nanoelectronics Eng.', 'NNE', 'School of Nanotechnology', 2021, 2025,
   'MSc Student', 'EPFL', 'Lausanne, CH', 'grad',
   'Quantum devices and very cold fridges. Recent grad, still pinching myself about Switzerland.',
   '[{"title":"Master''s Researcher","company":"EPFL","dates":"2025 — Present","desc":"Superconducting qubit fabrication and characterisation."}]'::jsonb,
   '+41 78 555 0122', 'tarek-sami', 'tsami', '@tarek_quantum', 'approved', 'alumni'),

  ('Lina Ashraf', 'lina.ashraf@zc.edu.eg', 'Materials Science & Eng.', 'MSE', 'School of Sciences & Engineering', 2020, 2024,
   'Product Designer', 'Swvl', 'Cairo, EG', 'other',
   'Engineer turned designer. I care about interfaces that respect people''s time.',
   '[{"title":"Product Designer","company":"Swvl","dates":"2024 — Present","desc":"Rider-app experience and design-system work."}]'::jsonb,
   '+20 128 555 0177', 'lina-ashraf', 'linaa', '@lina_designs', 'approved', 'alumni');

-- Optional: a few pending applications so the admin panel isn't empty on first run.
insert into public.profiles (full_name, email, major, status)
values
  ('Mahmoud El-Sayed', 'mahmoud.elsayed@zc.edu.eg', 'Communications & Information Eng.', 'pending'),
  ('Nada Hossam', 'nada.hossam@zc.edu.eg', 'Biomedical Sciences', 'pending'),
  ('Kareem Adel', 'kareem.adel@zc.edu.eg', 'Aerospace Engineering', 'pending'),
  ('Sara Mohsen', 'sara.mohsen@zc.edu.eg', 'Renewable Energy Eng.', 'pending');
