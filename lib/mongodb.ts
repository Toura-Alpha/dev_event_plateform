import mongoose from 'mongoose';

/**
 * MongoDB connection URI loaded from the environment.
 *
 * Keep all credentials outside the codebase and configure this
 * in `.env.local` as `MONGODB_URI`.
 */
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Invalid/Missing environment variable: "MONGODB_URI". Please set it in your .env.local file.',
  );
}

/**
 * Cached connection state, shared across hot-reloads in development.
 *
 * `conn` holds the resolved Mongoose instance once connected.
 * `promise` holds the in-flight connection attempt, so that
 * multiple callers share the same connection request.
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

/**
 * Augment the Node.js global type to include a `mongoose` cache.
 *
 * This avoids creating multiple connections during development
 * when Next.js reloads modules on every request/file change.
 */
declare global {
  // eslint-disable-next-line no-var
  // `var` is required here because we are augmenting the global scope.
  var mongoose: MongooseCache | undefined;
}

// Use the existing cache if it exists, otherwise initialize a new one.
const cached: MongooseCache = global.mongoose ?? (global.mongoose = {
  conn: null,
  promise: null,
});

/**
 * Establishes (or reuses) a Mongoose connection to MongoDB.
 *
 * This function is safe to call from both server components and API routes.
 * It will reuse an existing connection if available.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // If a cached connection exists, return it immediately.
  if (cached.conn) {
    return cached.conn;
  }

  // If no connection promise exists yet, create one.
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      // Disable Mongoose's internal buffering so that commands fail fast
      // when the connection is not available.
      bufferCommands: false,
      // Optionally set a database name if your URI does not include one.
      // dbName: process.env.MONGODB_DB,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset the promise so future calls can retry connection.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
