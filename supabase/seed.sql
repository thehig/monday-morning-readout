-- Seed data for users table
insert into public.users (name, email) values
    ('John Doe', 'john.doe@example.com'),
    ('Jane Smith', 'jane.smith@example.com'),
    ('Alice Johnson', 'alice.johnson@example.com');

-- Seed data for po_feedback table (if not exists)
insert into public.po_feedback (submitted_by, progress_percent, velocity_next_week, team_happiness, customer_happiness)
select 
    'example-user-id',
    75,
    'Gelb',
    8,
    9
where not exists (select 1 from public.po_feedback limit 1); 