import { Schema, model, models, HydratedDocument, Types } from 'mongoose';
import { EventModel } from './event.model';

/**
 * Booking domain model shape used by Mongoose.
 */
export interface Booking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingDocument = HydratedDocument<Booking>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<Booking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true, // Index for faster lookups by event
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string): boolean => emailRegex.test(value),
        message: 'Invalid email address.',
      },
    },
  },
  {
    // Automatically manage createdAt and updatedAt fields.
    timestamps: true,
  },
);

// Explicit index on eventId for query performance.
bookingSchema.index({ eventId: 1 });

/**
 * Pre-save hook to ensure the referenced event exists and
 * to enforce any additional business rules before creating a booking.
 */
bookingSchema.pre<BookingDocument>('save', async function (next) {
  try {
    // Only check when the reference is new or has changed.
    if (!this.isModified('eventId')) {
      return next();
    }

    const eventExists = await EventModel.exists({ _id: this.eventId });

    if (!eventExists) {
      return next(new Error('Cannot create booking: referenced event does not exist.'));
    }

    return next();
  } catch (error) {
    return next(error as Error);
  }
});

export const BookingModel = (models.Booking as ReturnType<typeof model<Booking>> | undefined) ??
  model<Booking>('Booking', bookingSchema);

export default BookingModel;
