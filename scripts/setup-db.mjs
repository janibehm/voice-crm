import { createClient } from '@libsql/client';

const databaseUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;

// Skip when we do not have a remote Turso URL (e.g. local dev build)
if (!databaseUrl || databaseUrl.startsWith('file:') || databaseUrl.includes('${')) {
  console.log('⚠️  Skipping Turso setup (no remote database URL provided)');
  process.exit(0);
}

const client = createClient({
  url: databaseUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function setupDatabase() {
  try {
    console.log('Setting up Turso database tables...');
    
    // Create User table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS User (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        emailVerified DATETIME,
        image TEXT
      );
    `);

    // Create Account table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS Account (
        userId TEXT NOT NULL,
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        providerAccountId TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        session_state TEXT,
        PRIMARY KEY (provider, providerAccountId),
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
      );
    `);

    // Create Session table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS Session (
        sessionToken TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        expires DATETIME NOT NULL,
        FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
      );
    `);

    // Create VerificationToken table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS VerificationToken (
        identifier TEXT NOT NULL,
        token TEXT NOT NULL,
        expires DATETIME NOT NULL,
        PRIMARY KEY (identifier, token)
      );
    `);

    console.log('✅ Database tables created successfully!');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
