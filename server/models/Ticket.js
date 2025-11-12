import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  request_text: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['password_reset', 'access_request', 'hardware', 'software', 'network', 'other'],
    default: 'other',
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'automated', 'escalated', 'completed', 'failed'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  complexity_score: {
    type: Number,
    default: 5,
  },
  auto_resolved: {
    type: Boolean,
    default: false,
  },
  assigned_to: {
    type: String,
  },
  resolution_notes: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  completed_at: {
    type: Date,
  },
  escalation_token: {
    type: String,
  },
  token_generated_at: {
    type: Date,
  },
  token_expires_at: {
    type: Date,
  },
});

ticketSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

export default mongoose.model('Ticket', ticketSchema);
