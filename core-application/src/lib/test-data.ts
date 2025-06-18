import { supabaseAdmin } from './supabase';

export async function createTestData() {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available. This function must run on the server.');
    }

    // Create test user profile first
    const userId = 'e2895575-a786-551f-ac71-b2530bbc877e'; // Demo user ID from the logs

    // Create folders
    const folders = [
      { name: 'Development', description: 'Development tools and resources' },
      { name: 'Design', description: 'Design inspiration and tools' },
      { name: 'Productivity', description: 'Productivity apps and tools' }
    ];

    const createdFolders = [];
    for (const folder of folders) {
      const { data: folderData, error: folderError } = await supabaseAdmin
        .from('folders')
        .insert({
          name: folder.name,
          description: folder.description,
          user_id: userId
        })
        .select()
        .single();

      if (folderError) {
        console.error('Error creating folder:', folderError);
        continue;
      }
      createdFolders.push(folderData);
    }

    // Create test bookmarks
    const testBookmarks = [
      {
        title: 'React Documentation',
        url: 'https://react.dev',
        description: 'Official React documentation and guides',
        folder_id: createdFolders.find(f => f.name === 'Development')?.id,
        user_id: userId,
        is_favorite: true
      },
      {
        title: 'Next.js Documentation',
        url: 'https://nextjs.org/docs',
        description: 'Complete guide to Next.js framework',
        folder_id: createdFolders.find(f => f.name === 'Development')?.id,
        user_id: userId,
        is_favorite: false
      },
      {
        title: 'TypeScript Handbook',
        url: 'https://www.typescriptlang.org/docs/',
        description: 'Learn TypeScript with the official handbook',
        folder_id: createdFolders.find(f => f.name === 'Development')?.id,
        user_id: userId,
        is_favorite: false
      },
      {
        title: 'Figma',
        url: 'https://figma.com',
        description: 'Collaborative design tool',
        folder_id: createdFolders.find(f => f.name === 'Design')?.id,
        user_id: userId,
        is_favorite: true
      },
      {
        title: 'Dribbble',
        url: 'https://dribbble.com',
        description: 'Design inspiration and showcases',
        folder_id: createdFolders.find(f => f.name === 'Design')?.id,
        user_id: userId,
        is_favorite: false
      },
      {
        title: 'Notion',
        url: 'https://notion.so',
        description: 'All-in-one workspace for notes and planning',
        folder_id: createdFolders.find(f => f.name === 'Productivity')?.id,
        user_id: userId,
        is_favorite: true
      },
      {
        title: 'Todoist',
        url: 'https://todoist.com',
        description: 'Task management and productivity app',
        folder_id: createdFolders.find(f => f.name === 'Productivity')?.id,
        user_id: userId,
        is_favorite: false
      }
    ];

    for (const bookmark of testBookmarks) {
      const { error: bookmarkError } = await supabaseAdmin
        .from('bookmarks')
        .insert(bookmark);

      if (bookmarkError) {
        console.error('Error creating bookmark:', bookmarkError);
      }
    }

    console.log('Test data created successfully!');
    return { success: true, foldersCreated: createdFolders.length, bookmarksCreated: testBookmarks.length };

  } catch (error) {
    console.error('Error creating test data:', error);
    return { success: false, error };
  }
} 