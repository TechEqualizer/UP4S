// API entities for the application
// This is a placeholder implementation - in a real app this would connect to your backend

export class User {
  static async me() {
    // Mock admin user for development
    return { id: 1, role: 'admin', email: 'admin@up4s.org' };
  }
}

export class Donation {
  static async list(orderBy = '-created_date', limit = 50) {
    // Mock donation data
    return [
      {
        id: 1,
        donor_name: 'John Doe',
        donor_email: 'john@example.com',
        amount: 100,
        donation_type: 'one-time',
        fund_designation: 'general',
        payment_status: 'completed',
        created_date: new Date().toISOString()
      }
    ];
  }
}

export class KidReferral {
  static async list(orderBy = '-created_date', limit = 50) {
    return [
      {
        id: 1,
        child_name: 'Sample Child',
        child_age: 12,
        guardian_name: 'Sample Guardian',
        guardian_email: 'guardian@example.com',
        guardian_phone: '555-0123',
        wish_description: 'Sample wish description',
        status: 'pending',
        urgency_level: 'medium',
        created_date: new Date().toISOString()
      }
    ];
  }

  static async filter(filters, orderBy, limit) {
    const items = await this.list(orderBy, limit);
    return items.filter(item => {
      return Object.entries(filters).every(([key, value]) => item[key] === value);
    });
  }
}

export class GalleryItem {
  static async list(orderBy = 'display_order', limit = 100) {
    return [
      {
        id: 1,
        title: 'Sample Gallery Item',
        description: 'Sample description',
        media_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop',
        media_type: 'image',
        category: 'wishes-granted',
        child_name: 'Sample Child',
        child_age: 12,
        is_featured: true,
        is_external_url: false,
        display_order: 0,
        created_date: new Date().toISOString()
      }
    ];
  }

  static async filter(filters, orderBy, limit) {
    const items = await this.list(orderBy, limit);
    return items.filter(item => {
      return Object.entries(filters).every(([key, value]) => item[key] === value);
    });
  }

  static async create(data) {
    console.log('Creating gallery item:', data);
    return { id: Date.now(), ...data };
  }

  static async update(id, data) {
    console.log('Updating gallery item:', id, data);
    return { id, ...data };
  }

  static async delete(id) {
    console.log('Deleting gallery item:', id);
    return true;
  }
}

export class NewsletterSubscriber {
  static async list(orderBy = '-created_date', limit = 50) {
    return [
      {
        id: 1,
        email: 'subscriber@example.com',
        first_name: 'Sample',
        subscription_source: 'footer',
        is_active: true,
        created_date: new Date().toISOString()
      }
    ];
  }
}

export class FundraisingEvent {
  static async list(orderBy = '-created_date', limit = 50) {
    return [
      {
        id: 1,
        title: 'Sample Fundraising Event',
        description: 'Sample event description',
        image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop',
        event_date: new Date().toISOString(),
        location: 'Sample Location',
        fundraising_goal: 5000,
        amount_raised: 2500,
        is_active: true,
        created_date: new Date().toISOString()
      }
    ];
  }

  static async create(data) {
    console.log('Creating event:', data);
    return { id: Date.now(), ...data };
  }

  static async update(id, data) {
    console.log('Updating event:', id, data);
    return { id, ...data };
  }

  static async delete(id) {
    console.log('Deleting event:', id);
    return true;
  }
}

export class FundraisingCampaign {
  static async list(orderBy = '-created_date', limit = 50) {
    return [];
  }
}