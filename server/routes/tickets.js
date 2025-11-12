import express from 'express';
import Ticket from '../models/Ticket.js';
import AuditLog from '../models/AuditLog.js';
import LLMInteraction from '../models/LLMInteraction.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const query = req.user.role === 'admin' || req.user.role === 'super_admin'
      ? {}
      : { user_id: req.user._id };

    const tickets = await Ticket.find(query).sort({ created_at: -1 });
    res.json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.user_id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { request_text, category, priority } = req.body;

    const ticket = new Ticket({
      user_id: req.user._id,
      request_text,
      category: category || 'other',
      priority: priority || 'medium',
      status: 'pending',
    });

    await ticket.save();

    const auditLog = new AuditLog({
      ticket_id: ticket._id,
      user_id: req.user._id,
      action_type: 'request_created',
      action_details: { request_text },
      success: true,
    });
    await auditLog.save();

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

router.patch('/:id', authenticate, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.user_id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const allowedUpdates = ['status', 'priority', 'assigned_to', 'resolution_notes',
                            'complexity_score', 'auto_resolved', 'completed_at'];

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        ticket[key] = req.body[key];
      }
    });

    // If the ticket is being escalated, generate an escalation token so an employee can pick it up
    if (req.body.status === 'escalated') {
      // create a simple token (can be replaced by a more secure token generator)
      const token = `${ticket._id.toString()}-${Math.random().toString(36).slice(2, 10)}`;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // token valid 24 hours

      ticket.escalation_token = token;
      ticket.token_generated_at = now;
      ticket.token_expires_at = expiresAt;
      // include token in resolution notes for visibility (optional)
      ticket.resolution_notes = ticket.resolution_notes
        ? `${ticket.resolution_notes}\nEscalation token: ${token}`
        : `Escalation token: ${token}`;
    }

    await ticket.save();

    const auditLog = new AuditLog({
      ticket_id: ticket._id,
      user_id: req.user._id,
      action_type: 'admin_action',
      action_details: req.body,
      success: true,
    });
    await auditLog.save();

    res.json(ticket);
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

router.get('/:id/logs', authenticate, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.user_id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const logs = await AuditLog.find({ ticket_id: req.params.id }).sort({ created_at: -1 });
    res.json(logs);
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

router.post('/:id/llm', authenticate, async (req, res) => {
  try {
    const { model, prompt, response, tokens_used, latency_ms } = req.body;

    const interaction = new LLMInteraction({
      ticket_id: req.params.id,
      model,
      prompt,
      response,
      tokens_used,
      latency_ms,
    });

    await interaction.save();
    res.status(201).json(interaction);
  } catch (error) {
    console.error('Create LLM interaction error:', error);
    res.status(500).json({ error: 'Failed to log LLM interaction' });
  }
});

export default router;
