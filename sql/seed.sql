-- Almajd (PHP) Seed Data (Optional)
-- Inserts a default admin user + default public profile (0000)

INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2y$10$jlKRzse3j7jEKbFTE76zoOyf.Q79Y7pNNWAceRI020/jbWzj/co0e')
ON CONFLICT (username) DO NOTHING;

-- Default public profile (0000) - reserved
INSERT INTO public_profiles (public_id, name, job_title, phone, whatsapp, email, avatar_url, slug, status)
VALUES (
  0,
  'Almajd Support',
  'Support',
  '+966500000000',
  '+966500000000',
  'support@almajd.local',
  '',
  'support-almajd',
  TRUE
)
ON CONFLICT (public_id) DO NOTHING;

-- Example public profile (0001)
INSERT INTO public_profiles (public_id, name, job_title, phone, whatsapp, email, avatar_url, slug, status)
VALUES (
  1,
  'أحمد محمد',
  'مدير التكنولوجيا',
  '+966500000001',
  '+966500000001',
  'ahmed@almajd.local',
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
  'ahmed-mohamed',
  TRUE
)
ON CONFLICT (public_id) DO NOTHING;
