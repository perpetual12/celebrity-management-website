import client from './config/database.js';

async function addProfileColumns() {
  try {
    console.log('🔧 Adding profile columns to users table...');

    // Check if columns already exist
    const checkColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('full_name', 'bio', 'profile_image')
    `);

    const existingColumns = checkColumns.rows.map(row => row.column_name);
    console.log('Existing profile columns:', existingColumns);

    // Add full_name column if it doesn't exist
    if (!existingColumns.includes('full_name')) {
      await client.query('ALTER TABLE users ADD COLUMN full_name VARCHAR(255)');
      console.log('✅ Added full_name column');
    } else {
      console.log('⏭️ full_name column already exists');
    }

    // Add bio column if it doesn't exist
    if (!existingColumns.includes('bio')) {
      await client.query('ALTER TABLE users ADD COLUMN bio TEXT');
      console.log('✅ Added bio column');
    } else {
      console.log('⏭️ bio column already exists');
    }

    // Add profile_image column if it doesn't exist
    if (!existingColumns.includes('profile_image')) {
      await client.query('ALTER TABLE users ADD COLUMN profile_image VARCHAR(500)');
      console.log('✅ Added profile_image column');
    } else {
      console.log('⏭️ profile_image column already exists');
    }

    console.log('');
    console.log('🎉 Profile columns migration completed successfully!');

    // Show updated table structure
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);

    console.log('');
    console.log('📋 Updated users table structure:');
    tableInfo.rows.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'nullable' : 'not null'}`);
    });

  } catch (error) {
    console.error('❌ Error adding profile columns:', error);
  } finally {
    await client.end();
  }
}

addProfileColumns();
