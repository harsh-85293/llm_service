import mongoose from 'mongoose';

const llmInteractionSchema = new mongoose.Schema({
  ticket_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
  },
  model: {
    type: String,
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  tokens_used: {
    type: Number,
    default: 0,
  },
  latency_ms: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('LLMInteraction', llmInteractionSchema);
