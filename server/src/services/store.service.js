import { db, isMock } from '../config/firebase.js';

/**
 * In-memory fallback database for local development and unit tests
 * Seeded with realistic enterprise CRM records
 */
const memoryStore = {
  leads: [
    {
      id: 'lead_1',
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'marcus.vance@vancetech.io',
      phone: '+1 (555) 234-5678',
      companyName: 'Vance Tech',
      source: 'website',
      status: 'new',
      assignedTo: 'user_sales_rep_123',
      notes: 'Interested in enterprise license for 20 sales representatives.',
      isConverted: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'lead_2',
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'priya@apexhealth.org',
      phone: '+1 (555) 345-6789',
      companyName: 'Apex Healthcare',
      source: 'referral',
      status: 'contacted',
      assignedTo: 'user_sales_rep_123',
      notes: 'Initial call completed. Looking for HIPAA compliant CRM workflows.',
      isConverted: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'lead_3',
      firstName: 'Jordan',
      lastName: 'Reed',
      email: 'j.reed@novalogistics.com',
      phone: '+1 (555) 456-7890',
      companyName: 'Nova Logistics',
      source: 'linkedin',
      status: 'qualified',
      assignedTo: 'user_sales_rep_123',
      notes: 'Budget approved for Q4. Ready for demo and proposal.',
      isConverted: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ],
  companies: [
    {
      id: 'comp_1',
      name: 'Acme Corporation',
      website: 'https://acme.com',
      industry: 'Technology',
      size: '51-200',
      annualRevenue: 15000000,
      ownerId: 'user_sales_rep_123',
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'comp_2',
      name: 'Global Zenith Logistics',
      website: 'https://zenithlogistics.com',
      industry: 'Services',
      size: '201-500',
      annualRevenue: 45000000,
      ownerId: 'user_sales_rep_123',
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
  contacts: [
    {
      id: 'cont_1',
      companyId: 'comp_1',
      companyName: 'Acme Corporation',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.jenkins@acme.com',
      phone: '+1 (555) 901-2345',
      jobTitle: 'VP of Technology',
      ownerId: 'user_sales_rep_123',
      isPrimary: true,
      createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'cont_2',
      companyId: 'comp_2',
      companyName: 'Global Zenith Logistics',
      firstName: 'David',
      lastName: 'Miller',
      email: 'david.m@zenithlogistics.com',
      phone: '+1 (555) 890-1234',
      jobTitle: 'Chief Operating Officer',
      ownerId: 'user_sales_rep_123',
      isPrimary: true,
      createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
  deals: [
    {
      id: 'deal_1',
      title: 'Cloud Infrastructure Migration',
      companyId: 'comp_1',
      companyName: 'Acme Corporation',
      contactId: 'cont_1',
      contactName: 'Sarah Jenkins',
      ownerId: 'user_sales_rep_123',
      amount: 45000,
      currency: 'USD',
      stage: '4_proposal_sent',
      probability: 70,
      expectedCloseDate: new Date(Date.now() + 86400000 * 14).toISOString(),
      stageChangedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'deal_2',
      title: 'Fleet Tracking AI Analytics',
      companyId: 'comp_2',
      companyName: 'Global Zenith Logistics',
      contactId: 'cont_2',
      contactName: 'David Miller',
      ownerId: 'user_sales_rep_123',
      amount: 85000,
      currency: 'USD',
      stage: '5_negotiation',
      probability: 85,
      expectedCloseDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      stageChangedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'deal_3',
      title: 'Q2 Security Audit & Remediation',
      companyId: 'comp_1',
      companyName: 'Acme Corporation',
      contactId: 'cont_1',
      contactName: 'Sarah Jenkins',
      ownerId: 'user_sales_rep_123',
      amount: 28000,
      currency: 'USD',
      stage: '6_won',
      probability: 100,
      closedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      stageChangedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
  ],
  tasks: [
    {
      id: 'task_1',
      title: 'Follow up on proposal feedback with Sarah',
      description: 'Review SLA clause questions from legal counsel.',
      dueDate: new Date(Date.now() + 86400000 * 1).toISOString(),
      priority: 'high',
      status: 'pending',
      assignedTo: 'user_sales_rep_123',
      entityType: 'deal',
      entityId: 'deal_1',
      entityTitle: 'Cloud Infrastructure Migration',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'task_2',
      title: 'Prepare final contract for David Miller',
      description: 'Include 12-month payment milestone schedule.',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      priority: 'urgent',
      status: 'pending',
      assignedTo: 'user_sales_rep_123',
      entityType: 'deal',
      entityId: 'deal_2',
      entityTitle: 'Fleet Tracking AI Analytics',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ],
  activities: [
    {
      id: 'act_1',
      entityType: 'deal',
      entityId: 'deal_1',
      type: 'call',
      title: 'Discovery call with VP of Technology',
      content: 'Sarah confirmed target go-live date is end of Q4. Discussed single sign-on requirements.',
      performedBy: 'user_sales_rep_123',
      performedByName: 'Sales Representative',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'act_2',
      entityType: 'contact',
      entityId: 'cont_1',
      type: 'meeting',
      title: 'Technical demo with engineering leads',
      content: 'Demoed dashboard metrics, API throughput, and automated Resend email triggers.',
      performedBy: 'user_sales_rep_123',
      performedByName: 'Sales Representative',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
  ],
};

/**
 * Universal Store Helper that abstracts Cloud Firestore and Memory Store
 */
export const store = {
  isMockStore: () => isMock || !db,

  // Collection Query
  async list(collectionName, filterFn = null) {
    if (this.isMockStore()) {
      const items = memoryStore[collectionName] || [];
      return filterFn ? items.filter(filterFn) : [...items];
    }
    const snapshot = await db.collection(collectionName).get();
    let items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    if (filterFn) {
      items = items.filter(filterFn);
    }
    return items;
  },

  // Document Find by ID
  async getById(collectionName, id) {
    if (this.isMockStore()) {
      const items = memoryStore[collectionName] || [];
      return items.find((item) => item.id === id) || null;
    }
    const doc = await db.collection(collectionName).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  // Insert Document
  async create(collectionName, data) {
    const id = data.id || `${collectionName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const record = {
      ...data,
      id,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };

    if (this.isMockStore()) {
      if (!memoryStore[collectionName]) memoryStore[collectionName] = [];
      memoryStore[collectionName].unshift(record);
      return record;
    }

    await db.collection(collectionName).doc(id).set(record);
    return record;
  },

  // Update Document
  async update(collectionName, id, updates) {
    const now = new Date().toISOString();
    if (this.isMockStore()) {
      const items = memoryStore[collectionName] || [];
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return null;
      items[index] = { ...items[index], ...updates, updatedAt: now };
      return items[index];
    }

    const docRef = db.collection(collectionName).doc(id);
    await docRef.update({ ...updates, updatedAt: now });
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() };
  },

  // Delete Document (Hard delete or helper)
  async delete(collectionName, id) {
    if (this.isMockStore()) {
      const items = memoryStore[collectionName] || [];
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return false;
      memoryStore[collectionName].splice(index, 1);
      return true;
    }
    await db.collection(collectionName).doc(id).delete();
    return true;
  },
};

