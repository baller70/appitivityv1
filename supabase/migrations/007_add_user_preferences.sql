-- Add user preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  theme VARCHAR(10) CHECK (theme IN ('light', 'dark', 'system')) DEFAULT 'system',
  view_mode VARCHAR(10) CHECK (view_mode IN ('grid', 'list', 'kanban')) DEFAULT 'grid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read own preferences" ON user_preferences
  FOR SELECT USING (get_current_user_id()::text = user_id::text);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (get_current_user_id()::text = user_id::text);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (get_current_user_id()::text = user_id::text);

-- Add trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE user_preferences IS 'Stores user UI preferences like theme and view mode'; 