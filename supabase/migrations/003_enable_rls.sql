-- Migration: Enable Row Level Security (RLS)
-- Created: 2024-06-02
-- Description: Enable RLS and create security policies for user data isolation

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_tags ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Folders policies
CREATE POLICY "Users can manage own folders" ON folders
    FOR ALL USING (auth.uid() = user_id);

-- Tags policies
CREATE POLICY "Users can manage own tags" ON tags
    FOR ALL USING (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can manage own bookmarks" ON bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- Bookmark_tags policies
CREATE POLICY "Users can manage own bookmark tags" ON bookmark_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM bookmarks 
            WHERE bookmarks.id = bookmark_tags.bookmark_id 
            AND bookmarks.user_id = auth.uid()
        )
    ); 