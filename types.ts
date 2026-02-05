
export enum UserRole {
  TEACHER = 'Teacher',
  STUDENT = 'Student'
}

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  email?: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  due_date?: string;
  created_at: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  questions_json: QuizQuestion[];
  title: string;
}

export interface Submission {
  id: string;
  user_id: string;
  activity_name: string;
  drive_link: string;
  created_at: string;
  user_profile?: Profile;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
}
