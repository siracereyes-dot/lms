
-- 1. Create custom types
CREATE TYPE user_role AS ENUM ('Teacher', 'Student');

-- 2. Create Profiles table (linked to Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'Student' NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create Lessons table
CREATE TABLE lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create Quizzes table
CREATE TABLE quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  questions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Create Submissions table
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity_name TEXT NOT NULL,
  drive_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Create User Progress table
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, lesson_id)
);

-- 7. ENABLE ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- 8. POLICIES

-- Profiles: Anyone authenticated can read profiles (to see names), only owner can update
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Lessons: Students/Teachers can read, only Teachers can CRUD
CREATE POLICY "Lessons are viewable by everyone." ON lessons FOR SELECT USING (true);
CREATE POLICY "Only teachers can manage lessons." ON lessons FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Teacher'));

-- Quizzes: Same as lessons
CREATE POLICY "Quizzes are viewable by everyone." ON quizzes FOR SELECT USING (true);
CREATE POLICY "Only teachers can manage quizzes." ON quizzes FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Teacher'));

-- Submissions: Students see own, Teachers see all
CREATE POLICY "Users can view own submissions." ON submissions FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Teacher'));
CREATE POLICY "Students can insert submissions." ON submissions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- User Progress: Students see/create own, Teachers see all
CREATE POLICY "Users can view own progress." ON user_progress FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Teacher'));
CREATE POLICY "Students can update own progress." ON user_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 9. SEED DATA (Optional)
INSERT INTO lessons (title, content) VALUES 
('Introduction to React 19', 'React 19 brings exciting features like the "use" hook and automated memoization...'),
('Understanding Supabase RLS', 'Row Level Security is the backbone of Supabase security. It allows you to write SQL rules that control access...');

-- 10. TRIGGER FOR NEW USERS
-- This function automatically creates a profile when someone signs up through Supabase Auth.
-- It extracts 'full_name' and 'role' from the auth metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Student User'), 
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'Student'::user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
