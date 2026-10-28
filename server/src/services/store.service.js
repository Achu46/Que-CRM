import { db, isMock } from '../config/firebase.js';

/**
 * Multi-Tenant Data Store for local development, testing, and Firestore
 * Seeded with multiple isolated tenant organizations
 */
const memoryStore = {
  organizations: [
    {
      id: 'org_ove_main',
      name: 'OVE Solutions HQ',
      slug: 'ove-solutions',
      plan: 'enterprise',
      status: 'active',
      ownerId: 'user_admin_123',
      limits: {
        maxLeads: 100000,
        maxMembers: 50,
        geminiTier: 'unlimited',
        webhooksEnabled: true,
      },
      createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    },
    {
      id: 'org_que_corp',
      name: 'QUE Global Enterprises',
      slug: 'que-global',
      plan: 'pro',
      status: 'active',
      ownerId: 'user_admin_123',
      limits: {
        maxLeads: 10000,
        maxMembers: 10,
        geminiTier: 'pro',
        webhooksEnabled: true,
      },
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
  ],
  subscriptionPlans: [
    {
      id: 'starter',
      name: 'Starter Tier',
      tagline: 'Ideal for small sales teams initiating structured outreach',
      priceMonthly: 49,
      priceAnnual: 490,
      currency: 'USD',
      limits: {
        maxLeads: 1000,
        maxMembers: 3,
        geminiTier: 'basic',
        webhooksEnabled: false,
        bulkImportEnabled: true,
      },
      features: [
        'Up to 1,000 Contacts & Leads',
        '3 Active Team Members',
        'Standard Kanban Pipeline',
        'Resend Email Outreach',
        'CSV Lead Import',
      ],
      isPopular: false,
    },
    {
      id: 'pro',
      name: 'Professional Tier',
      tagline: 'For fast-growing companies demanding automated distribution and AI',
      priceMonthly: 149,
      priceAnnual: 1490,
      currency: 'USD',
      limits: {
        maxLeads: 10000,
        maxMembers: 10,
        geminiTier: 'pro',
        webhooksEnabled: true,
        bulkImportEnabled: true,
      },
      features: [
        'Up to 10,000 Contacts & Leads',
        '10 Active Team Members',
        'Automated Round-Robin Lead Distribution',
        'Google Gemini AI Touchpoint Summaries',
        'AI Email Composer with Resend',
        'n8n Inbound Webhooks & Automation',
      ],
      isPopular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise Tier',
      tagline: 'High-volume organizations requiring unlimited scale and governance',
      priceMonthly: 499,
      priceAnnual: 4990,
      currency: 'USD',
      limits: {
        maxLeads: 100000,
        maxMembers: 50,
        geminiTier: 'unlimited',
        webhooksEnabled: true,
        bulkImportEnabled: true,
      },
      features: [
        'Up to 100,000 Contacts & Leads',
        '50 Team Members with Granular RBAC',
        'Round-Robin & Custom Distribution Pools',
        'Priority Gemini AI Intelligence Engine',
        'Platform Audit Logs & Dedicated Webhooks',
        '24/7 Dedicated SaaS SLA & Support',
      ],
      isPopular: false,
    },
  ],
  organizationApplications: [
    {
      id: 'app_apex_1',
      companyName: 'Apex Logistics Ltd',
      workEmail: 'admin@apexlogistics.com',
      phone: '+1 (555) 345-6789',
      industry: 'Supply Chain & Logistics',
      companySize: '51-200',
      ownerName: 'Marcus Vance',
      planId: 'pro',
      billingCycle: 'annual',
      amountDue: 1490,
      currency: 'USD',
      status: 'under_review',
      paymentReference: 'UTR-98231448',
      proofNotes: 'Wire transfer payment of $1,490 submitted from Chase bank ending #4012.',
      proofFileUrl: 'https://storage.ove.com/receipts/apex_wire_98231.pdf',
      submittedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'app_zeta_2',
      companyName: 'Zeta BioHealth Corp',
      workEmail: 'contact@zetabio.com',
      phone: '+1 (555) 890-1234',
      industry: 'Healthcare & Biotech',
      companySize: '201-500',
      ownerName: 'Dr. Aris Thorne',
      planId: 'enterprise',
      billingCycle: 'monthly',
      amountDue: 499,
      currency: 'USD',
      status: 'payment_pending',
      paymentReference: null,
      proofNotes: null,
      proofFileUrl: null,
      submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
  memberships: [
    {
      id: 'mem_1',
      userId: 'user_admin_123',
      userName: 'Sarah Chen',
      userEmail: 'admin@ove.com',
      tenantId: 'org_ove_main',
      role: 'tenant_owner',
      isActive: true,
      createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    },
    {
      id: 'mem_2',
      userId: 'user_sales_rep_123',
      userName: 'Alex Morgan',
      userEmail: 'sales@ove.com',
      tenantId: 'org_ove_main',
      role: 'sales_rep',
      isActive: true,
      createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    },
    {
      id: 'mem_3',
      userId: 'user_admin_123',
      userName: 'Sarah Chen',
      userEmail: 'admin@ove.com',
      tenantId: 'org_que_corp',
      role: 'tenant_admin',
      isActive: true,
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
  ],
  auditLogs: [
    {
      id: 'audit_log_1',
      action: 'tenant_activated',
      actorId: 'user_super_admin_1',
      actorEmail: 'superadmin@ove.com',
      targetType: 'organization',
      targetId: 'org_ove_main',
      details: 'SuperAdmin provisioned primary tenant workspace OVE Solutions HQ with Enterprise plan.',
      createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    },
    {
      id: 'audit_log_2',
      action: 'tenant_activated',
      actorId: 'user_super_admin_1',
      actorEmail: 'superadmin@ove.com',
      targetType: 'organization',
      targetId: 'org_que_corp',
      details: 'SuperAdmin approved application for QUE Global Enterprises with Pro plan.',
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
  ],
  leads: [
    // Tenant: org_ove_main
    {
      id: 'lead_1',
      tenantId: 'org_ove_main',
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
      tenantId: 'org_ove_main',
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
      tenantId: 'org_ove_main',
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
    // Tenant: org_que_corp (Isolated Tenant Data)
    {
      id: 'lead_que_1',
      tenantId: 'org_que_corp',
      firstName: 'Liam',
      lastName: 'Gallagher',
      email: 'liam@manchester-sound.uk',
      phone: '+44 20 7946 0991',
      companyName: 'Manchester Sound Ltd',
      source: 'website',
      status: 'new',
      assignedTo: 'user_admin_123',
      notes: 'Que Global client looking for international logistics integration.',
      isConverted: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ],
  companies: [
    {
      id: 'comp_1',
      tenantId: 'org_ove_main',
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
      tenantId: 'org_ove_main',
      name: 'Global Zenith Logistics',
      website: 'https://zenithlogistics.com',
      industry: 'Services',
      size: '201-500',
      annualRevenue: 45000000,
      ownerId: 'user_sales_rep_123',
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'comp_que_1',
      tenantId: 'org_que_corp',
      name: 'Manchester Sound Ltd',
      website: 'https://manchestersound.uk',
      industry: 'Media & Entertainment',
      size: '11-50',
      annualRevenue: 3000000,
      ownerId: 'user_admin_123',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ],
  contacts: [
    {
      id: 'cont_1',
      tenantId: 'org_ove_main',
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
      tenantId: 'org_ove_main',
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
      tenantId: 'org_ove_main',
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
      tenantId: 'org_ove_main',
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
      tenantId: 'org_ove_main',
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
    {
      id: 'deal_que_1',
      tenantId: 'org_que_corp',
      title: 'Studio Audio Overhaul',
      companyId: 'comp_que_1',
      companyName: 'Manchester Sound Ltd',
      amount: 32000,
      currency: 'GBP',
      stage: '2_qualified',
      probability: 40,
      ownerId: 'user_admin_123',
      stageChangedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  tasks: [
    {
      id: 'task_1',
      tenantId: 'org_ove_main',
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
      tenantId: 'org_ove_main',
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
      tenantId: 'org_ove_main',
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
      tenantId: 'org_ove_main',
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
  emailLogs: [],
};

const GLOBAL_COLLECTIONS = [
  'organizations',
  'organizationApplications',
  'subscriptionPlans',
  'auditLogs',
  'users',
];

function isGlobalCollection(name) {
  return GLOBAL_COLLECTIONS.includes(name);
}

/**
 * Universal Store Helper that abstracts Cloud Firestore and Memory Store with Multi-Tenancy
 */
export const store = {
  isMockStore: () => isMock || !db,

  // Collection Query with Tenant Isolation
  async list(collectionName, filterFn = null, tenantId = null) {
    const isGlobal = isGlobalCollection(collectionName);
    if (this.isMockStore()) {
      const items = memoryStore[collectionName] || [];
      return items.filter((item) => {
        // Enforce tenant boundary unless collection is global or tenantId not specified
        if (!isGlobal && tenantId && item.tenantId && item.tenantId !== tenantId) {
          return false;
        }
        return filterFn ? filterFn(item) : true;
      });
    }

    let query = db.collection(collectionName);
    if (!isGlobal && tenantId) {
      query = query.where('tenantId', '==', tenantId);
    }

    const snapshot = await query.get();
    let items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    if (filterFn) {
      items = items.filter(filterFn);
    }
    return items;
  },

  // Document Find by ID with Tenant Scoping
  async getById(collectionName, id, tenantId = null) {
    const isGlobal = isGlobalCollection(collectionName);
    if (this.isMockStore()) {
      const items = memoryStore[collectionName] || [];
      const item = items.find((it) => it.id === id);
      if (!item) return null;
      if (!isGlobal && tenantId && item.tenantId && item.tenantId !== tenantId) {
        return null;
      }
      return item;
    }

    const doc = await db.collection(collectionName).doc(id).get();
    if (!doc.exists) return null;
    const data = { id: doc.id, ...doc.data() };
    if (!isGlobal && tenantId && data.tenantId && data.tenantId !== tenantId) {
      return null;
    }
    return data;
  },

  // Insert Document (Automatically tags with tenantId)
  async create(collectionName, data, tenantId = null) {
    const id = data.id || `${collectionName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const isGlobal = isGlobalCollection(collectionName);
    const effectiveTenantId = tenantId || data.tenantId || (!isGlobal ? 'org_ove_main' : undefined);

    const record = {
      ...data,
      id,
      ...(!isGlobal && effectiveTenantId ? { tenantId: effectiveTenantId } : {}),
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

  // Batch insert documents for bulk import
  async createBatch(collectionName, records, tenantId = null) {
    const createdRecords = [];
    for (const data of records) {
      const rec = await this.create(collectionName, data, tenantId);
      createdRecords.push(rec);
    }
    return createdRecords;
  },

  // Update Document
  async update(collectionName, id, updates, tenantId = null) {
    const isGlobal = isGlobalCollection(collectionName);
    const now = new Date().toISOString();
    if (this.isMockStore()) {
      const items = memoryStore[collectionName] || [];
      const index = items.findIndex((item) => {
        if (item.id !== id) return false;
        if (!isGlobal && tenantId && item.tenantId && item.tenantId !== tenantId) {
          return false;
        }
        return true;
      });
      if (index === -1) return null;
      items[index] = { ...items[index], ...updates, updatedAt: now };
      return items[index];
    }

    const docRef = db.collection(collectionName).doc(id);
    const existing = await docRef.get();
    if (!existing.exists) return null;
    if (!isGlobal && tenantId && existing.data().tenantId !== tenantId) {
      return null;
    }

    await docRef.update({ ...updates, updatedAt: now });
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() };
  },

  // Delete Document
  async delete(collectionName, id, tenantId = null) {
    const isGlobal = isGlobalCollection(collectionName);
    if (this.isMockStore()) {
      const items = memoryStore[collectionName] || [];
      const index = items.findIndex((item) => {
        if (item.id !== id) return false;
        if (!isGlobal && tenantId && item.tenantId && item.tenantId !== tenantId) {
          return false;
        }
        return true;
      });
      if (index === -1) return false;
      memoryStore[collectionName].splice(index, 1);
      return true;
    }

    const docRef = db.collection(collectionName).doc(id);
    const existing = await docRef.get();
    if (!existing.exists) return false;
    if (!isGlobal && tenantId && existing.data().tenantId !== tenantId) {
      return false;
    }

    await docRef.delete();
    return true;
  },
};
