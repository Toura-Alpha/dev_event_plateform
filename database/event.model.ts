import { Schema, model, models, HydratedDocument } from 'mongoose';

/**
 * Event domain model shape used by Mongoose.
 */
export interface Event {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  /** Normalized ISO date string (YYYY-MM-DD). */
  date: string;
  /** Normalized 24h time string (HH:mm). */
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type EventDocument = HydratedDocument<Event>;

/**
 * Ensure string fields are present and non-empty after trimming.
 */
const nonEmptyStringValidator = {
  validator: (value: string): boolean =>
    typeof value === 'string' && value.trim().length > 0,
  message: '{PATH} is required and cannot be empty.',
};

/**
 * Generate a URL-friendly slug from an event title.
 */
function slugify(title: string): string {
  return title
    .toString()
    .trim()
    .toLowerCase()
    // Replace non-alphanumeric characters with a hyphen
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Normalize a date string to ISO format (YYYY-MM-DD).
 * Throws if the value cannot be parsed to a valid date.
 */
function normalizeDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error('Date is required and cannot be empty.');
  }

  const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (isoDatePattern.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date format: "${value}".`);
  }

  // Convert to YYYY-MM-DD in UTC.
  return parsed.toISOString().slice(0, 10);
}

/**
 * Normalize a time string to 24h format HH:mm.
 * Throws if the value cannot be parsed or is out of range.
 */
function normalizeTime(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error('Time is required and cannot be empty.');
  }

  const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (!match) {
    throw new Error(`Invalid time format (expected HH:mm): "${value}".`);
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(`Invalid time value: "${value}".`);
  }

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');

  return `${hh}:${mm}`;
}

const eventSchema = new Schema<Event>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      validate: nonEmptyStringValidator,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      validate: nonEmptyStringValidator,
    },
    overview: {
      type: String,
      required: true,
      trim: true,
      validate: nonEmptyStringValidator,
    },
    image: {
      type: String,
      required: true,
      trim: true,
      validate: nonEmptyStringValidator,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
      validate: nonEmptyStringValidator,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      validate: nonEmptyStringValidator,
    },
    date: {
      type: String,
      required: true,
      trim: true,
      validate: nonEmptyStringValidator,
    },
    time: {
      type: String,
      required: true,
      trim: true,
      validate: nonEmptyStringValidator,
    },
    mode: {
      type: String,
      required: true,
      trim: true,
      validate: nonEmptyStringValidator,
    },
    audience: {
      type: String,
      required: true,
      trim: true,
      validate: nonEmptyStringValidator,
    },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]): boolean =>
          Array.isArray(value) &&
          value.length > 0 &&
          value.every((item) => typeof item === 'string' && item.trim().length > 0),
        message: 'Agenda must contain at least one non-empty item.',
      },
    },
    organizer: {
      type: String,
      required: true,
      trim: true,
      validate: nonEmptyStringValidator,
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]): boolean =>
          Array.isArray(value) &&
          value.length > 0 &&
          value.every((item) => typeof item === 'string' && item.trim().length > 0),
        message: 'Tags must contain at least one non-empty item.',
      },
    },
  },
  {
    // Automatically manage createdAt and updatedAt fields.
    timestamps: true,
  },
);

// Ensure slug has a unique index at the database level.
eventSchema.index({ slug: 1 }, { unique: true });

/**
 * Pre-save hook to:
 * - Generate a URL-safe slug from the title when the title changes.
 * - Normalize date to ISO format (YYYY-MM-DD).
 * - Normalize time to 24h HH:mm format.
 */
eventSchema.pre<EventDocument>('save', function (next) {
  try {
    if (this.isModified('title')) {
      this.slug = slugify(this.title);
    }

    this.date = normalizeDate(this.date);
    this.time = normalizeTime(this.time);

    next();
  } catch (error) {
    next(error as Error);
  }
});

export const EventModel = (models.Event as ReturnType<typeof model<Event>> | undefined) ??
  model<Event>('Event', eventSchema);

export default EventModel;
