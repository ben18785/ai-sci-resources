-- ============================================================
-- PROGRAMMING LANGUAGES — run ONCE in the Supabase SQL Editor.
-- Adds: languages on profiles (asked at sign-up) and on
-- resources (tagged when suggesting), plus tags for the obvious
-- existing seed resources so the language filter has data.
-- ============================================================

alter table profiles  add column if not exists languages text[] not null default '{}';
alter table resources add column if not exists languages text[] not null default '{}';

-- Tag the clearly language-specific seed resources (matched by title;
-- only fills in entries not already tagged)
update resources set languages = array['Python'] where languages = '{}' and (
     title ilike 'Think Python%' or title ilike 'Machine Learning from Scratch%'
  or title ilike 'Crash Course on Python%' or title ilike 'Python for Data Science%'
  or title ilike 'Deep Neural Networks with PyTorch%' or title ilike 'Introduction to TensorFlow%'
  or title ilike 'CS50%' or title ilike '6.0001%'
  or title ilike 'Deep Learning Basics%' or title ilike 'UvA Deep Learning%'
  or title ilike 'Dive into Deep Learning%' or title ilike 'Deep Learning with Python%'
  or title ilike 'Practical Deep Learning for Coders%'
  or title ilike 'Supervised Machine Learning%' or title ilike 'Unsupervised Learning, Recommenders%'
  or title ilike 'Deep Learning Specialization%' or title ilike 'Symbolic Model Discovery%'
  or title ilike 'RAG Copilot%' or title ilike 'Mathematical Foundations of Machine Learning%'
  or title ilike 'Knowledge-Guided Machine Learning%' or title ilike 'Foundation Model for Science%'
  or title ilike 'Audio Signal Processing%'
);

update resources set languages = array['R'] where languages = '{}' and (
     title ilike 'Hands-On Programming with R%' or title ilike 'Hands-On Machine Learning with R%'
  or title ilike 'Data Analysis with R%' or title ilike 'Bayesian Statistics Specialization%'
  or title ilike 'A Student%s Guide to Bayesian%'
);

update resources set languages = array['R','Python'] where languages = '{}' and (
     title ilike 'Statistical Rethinking%' or title ilike 'U Toronto Map & Data Library%'
);

update resources set languages = array['R','Python','MATLAB'] where languages = '{}' and
     title ilike 'Bayesian Data Analysis%';
