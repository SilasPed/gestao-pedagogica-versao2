-- Gestão Escolar PRO — dados acadêmicos isolados por escola.

create table if not exists schools (
  id text primary key,
  owner_user_id text not null,
  name text not null,
  invite_code text not null unique,
  grade_scale_max double precision not null default 10,
  passing_average double precision not null default 6,
  period_model text not null default 'bimestre',
  calculation_mode text not null default 'weighted',
  recovery_policy text not null default 'replace_if_higher',
  absence_counts_as_zero boolean not null default false,
  justified_rule text not null default 'presence',
  late_rule text not null default 'presence',
  frequency_min_percent double precision not null default 75,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schools_period_model_chk check (period_model in ('bimestre', 'trimestre', 'semestre')),
  constraint schools_calc_chk check (calculation_mode in ('simple', 'weighted')),
  constraint schools_recovery_chk check (recovery_policy in ('replace_if_higher', 'average_with_original', 'keep_both')),
  constraint schools_justified_chk check (justified_rule in ('presence', 'absence', 'ignore')),
  constraint schools_late_chk check (late_rule in ('presence', 'absence', 'ignore'))
);

create table if not exists school_members (
  school_id text not null references schools(id) on delete cascade,
  user_id text not null,
  role text not null default 'professor',
  display_name text not null default '',
  subject_scope text,
  created_at timestamptz not null default now(),
  primary key (school_id, user_id),
  constraint school_members_role_chk check (role in ('admin', 'coordenacao', 'professor'))
);

create index if not exists school_members_user_idx on school_members (user_id);

create table if not exists school_years (
  id text primary key,
  school_id text not null references schools(id) on delete cascade,
  label text not null,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  unique (school_id, label)
);

create table if not exists periods (
  id text primary key,
  school_id text not null references schools(id) on delete cascade,
  year_id text not null references school_years(id) on delete cascade,
  ord integer not null,
  name text not null,
  kind text not null,
  unique (year_id, ord)
);

create table if not exists courses (
  id text primary key,
  school_id text not null references schools(id) on delete cascade,
  name text not null,
  unique (school_id, name)
);

create table if not exists subjects (
  id text primary key,
  school_id text not null references schools(id) on delete cascade,
  name text not null,
  code text not null default '',
  teacher_name text not null default '',
  unique (school_id, name)
);

create table if not exists staff (
  id text primary key,
  school_id text not null references schools(id) on delete cascade,
  name text not null,
  role_label text not null default 'Professor',
  unique (school_id, name)
);

create table if not exists classes (
  id text primary key,
  school_id text not null references schools(id) on delete cascade,
  year_id text not null references school_years(id) on delete cascade,
  course_id text references courses(id) on delete set null,
  series text not null,
  name text not null,
  teacher_name text not null default '',
  passing_average double precision,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint classes_series_chk check (series in ('1', '2', '3'))
);

create unique index if not exists classes_active_name_idx
  on classes (school_id, year_id, series, name)
  where archived = false;

create table if not exists class_subjects (
  id text primary key,
  school_id text not null references schools(id) on delete cascade,
  class_id text not null references classes(id) on delete cascade,
  subject_id text not null references subjects(id) on delete cascade,
  teacher_name text not null default '',
  unique (class_id, subject_id)
);

create table if not exists students (
  id text primary key,
  school_id text not null references schools(id) on delete cascade,
  full_name text not null,
  enrollment_code text,
  year_id text references school_years(id) on delete set null,
  class_id text references classes(id) on delete set null,
  course_id text references courses(id) on delete set null,
  series text,
  status text not null default 'ativo',
  notes text not null default '',
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint students_status_chk check (status in ('ativo', 'transferido', 'concluido', 'inativo')),
  constraint students_series_chk check (series is null or series in ('1', '2', '3'))
);

create unique index if not exists students_enrollment_idx
  on students (school_id, enrollment_code)
  where enrollment_code is not null and enrollment_code <> '';

create index if not exists students_school_name_idx on students (school_id, full_name);
create index if not exists students_class_idx on students (class_id);

create table if not exists student_enrollments (
  id text primary key,
  school_id text not null references schools(id) on delete cascade,
  student_id text not null references students(id) on delete cascade,
  year_id text not null references school_years(id) on delete cascade,
  class_id text references classes(id) on delete set null,
  course_id text references courses(id) on delete set null,
  series text,
  status text not null default 'ativo',
  started_on date,
  ended_on date,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists enrollments_student_idx on student_enrollments (student_id);

create table if not exists assessments (
  id text primary key,
  school_id text not null references schools(id) on delete cascade,
  class_id text not null references classes(id) on delete cascade,
  subject_id text not null references subjects(id) on delete cascade,
  period_id text references periods(id) on delete set null,
  name text not null,
  assessed_on date,
  kind text not null default 'prova',
  max_score double precision not null,
  weight double precision not null default 1,
  notes text not null default '',
  is_recovery boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assessments_kind_chk check (kind in ('prova', 'trabalho', 'atividade', 'projeto', 'participacao', 'recuperacao')),
  constraint assessments_weight_chk check (weight > 0),
  constraint assessments_max_chk check (max_score > 0)
);

create index if not exists assessments_class_idx on assessments (class_id, subject_id);
create index if not exists assessments_school_idx on assessments (school_id);

create table if not exists scores (
  id text primary key,
  school_id text not null references schools(id) on delete cascade,
  assessment_id text not null references assessments(id) on delete cascade,
  student_id text not null references students(id) on delete cascade,
  value double precision,
  mark_status text not null default 'pending',
  notes text not null default '',
  updated_at timestamptz not null default now(),
  unique (assessment_id, student_id),
  constraint scores_status_chk check (mark_status in ('graded', 'pending', 'absent', 'excused', 'na'))
);

create index if not exists scores_student_idx on scores (student_id);
create index if not exists scores_school_idx on scores (school_id);

create table if not exists qual_criteria (
  id text primary key,
  school_id text not null references schools(id) on delete cascade,
  name text not null,
  description text not null default '',
  scale text not null,
  active boolean not null default true,
  ord integer not null default 0,
  unique (school_id, name)
);

create table if not exists qual_records (
  id text primary key,
  school_id text not null references schools(id) on delete cascade,
  student_id text not null references students(id) on delete cascade,
  criterion_id text not null references qual_criteria(id) on delete cascade,
  period_id text references periods(id) on delete set null,
  recorded_on date not null,
  level text not null,
  comment text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists qual_student_idx on qual_records (student_id, recorded_on);

create table if not exists attendance_sessions (
  id text primary key,
  school_id text not null references schools(id) on delete cascade,
  class_id text not null references classes(id) on delete cascade,
  subject_id text references subjects(id) on delete set null,
  period_id text references periods(id) on delete set null,
  session_date date not null,
  label text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists attendance_class_idx on attendance_sessions (class_id, session_date);

create table if not exists attendance_marks (
  id text primary key,
  school_id text not null references schools(id) on delete cascade,
  session_id text not null references attendance_sessions(id) on delete cascade,
  student_id text not null references students(id) on delete cascade,
  mark text not null default 'pending',
  unique (session_id, student_id),
  constraint attendance_mark_chk check (mark in ('present', 'absent', 'justified', 'late', 'pending'))
);

create table if not exists audit_log (
  id text primary key,
  school_id text not null references schools(id) on delete cascade,
  user_id text not null,
  action text not null,
  entity text not null,
  entity_id text,
  summary text not null,
  created_at timestamptz not null default now()
);

create index if not exists audit_school_idx on audit_log (school_id, created_at desc);
