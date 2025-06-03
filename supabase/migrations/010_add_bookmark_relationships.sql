-- Migration: Add bookmark relationships table
-- Created: 2024-06-03
-- Description: Allow bookmarks to be associated with each other as related bookmarks

-- Create bookmark_relationships table
CREATE TABLE IF NOT EXISTS bookmark_relationships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bookmark_id UUID REFERENCES bookmarks(id) ON DELETE CASCADE NOT NULL,
    related_bookmark_id UUID REFERENCES bookmarks(id) ON DELETE CASCADE NOT NULL,
    relationship_type TEXT DEFAULT 'related' CHECK (relationship_type IN ('related', 'similar', 'dependency', 'reference')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    UNIQUE(bookmark_id, related_bookmark_id),
    -- Prevent self-references
    CHECK (bookmark_id != related_bookmark_id)
);

-- Add RLS policies for bookmark_relationships
ALTER TABLE bookmark_relationships ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see relationships for their own bookmarks
CREATE POLICY "Users can view their bookmark relationships" ON bookmark_relationships
    FOR SELECT USING (
        bookmark_id IN (
            SELECT id FROM bookmarks WHERE user_id = (
                SELECT id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Policy: Users can create relationships between their own bookmarks
CREATE POLICY "Users can create bookmark relationships" ON bookmark_relationships
    FOR INSERT WITH CHECK (
        bookmark_id IN (
            SELECT id FROM bookmarks WHERE user_id = (
                SELECT id FROM profiles WHERE id = auth.uid()
            )
        ) AND
        related_bookmark_id IN (
            SELECT id FROM bookmarks WHERE user_id = (
                SELECT id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Policy: Users can delete their own bookmark relationships
CREATE POLICY "Users can delete their bookmark relationships" ON bookmark_relationships
    FOR DELETE USING (
        bookmark_id IN (
            SELECT id FROM bookmarks WHERE user_id = (
                SELECT id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookmark_relationships_bookmark_id ON bookmark_relationships(bookmark_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_relationships_related_bookmark_id ON bookmark_relationships(related_bookmark_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_relationships_type ON bookmark_relationships(relationship_type); 