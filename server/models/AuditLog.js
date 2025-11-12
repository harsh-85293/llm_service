import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  ticket_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  action_type: {
    type: String,
    enum: ['request_created', 'ai_analysis', 'automation_executed', 'escalated', 'admin_action', 'completed'],
    required: true,
  },
  action_details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  success: {
    type: Boolean,
    default: true,
  },
  error_message: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('AuditLog', auditLogSchema);
