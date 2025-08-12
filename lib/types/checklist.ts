export type ServiceType = 
  | 'move_in'
  | 'move_out'
  | 'deep_clean'
  | 'regular'
  | 'post_construction'
  | 'airbnb';

export type PropertyType =
  | 'apartment'
  | 'house'
  | 'condo'
  | 'office'
  | 'retail'
  | 'warehouse';

export type RoomType =
  | 'bedroom'
  | 'bathroom'
  | 'kitchen'
  | 'living_room'
  | 'dining_room'
  | 'office'
  | 'garage'
  | 'basement'
  | 'attic'
  | 'hallway'
  | 'laundry'
  | 'closet'
  | 'balcony'
  | 'patio';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category: string;
  order: number;
  notes?: string;
  customField?: string;
  timeEstimate?: number;
  roomId?: string;
}

export interface Room {
  id: string;
  name: string;
  type: RoomType | string;
  floor?: number;
  customTasks?: ChecklistItem[];
}

export interface Checklist {
  id: string;
  name: string;
  items: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
  serviceType: ServiceType;
  propertyType: PropertyType;
  rooms?: Room[];
  templateId?: string;
  customerId?: string;
  notes?: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description?: string;
  serviceType: ServiceType;
  propertyType: PropertyType;
  defaultItems: Omit<ChecklistItem, 'id' | 'completed'>[];
  createdAt: Date;
  updatedAt: Date;
  isDefault: boolean;
  customFields?: Record<string, any>;
}

export interface ChecklistMetadataType {
  serviceType: ServiceType;
  propertyType: PropertyType;
  includePhotos: boolean;
  rooms: string[];
  customTasks: string[];
  dateCreated: Date;
  lastModified: Date;
  clientName?: string;
  location?: string;
  serviceDate?: Date;
  assignedStaff?: string[];
  notes?: string;
}
