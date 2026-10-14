// 1. Payload sent by the hospital dashboard when updating inventory
export interface IUpsertHospitalResourceDTO {
  resource_id: number;
  quantity: number;
  is_available?: boolean;
}

// 2. Shape of a resource item in a hospital's inventory
export interface IHospitalResourceItem {
  id: number;
  hospital_id: string;
  resource_id: number;
  resource_name: string;
  category_id: number;
  category_name: string;
  quantity: number;
  is_available: boolean;
  updated_at: Date | string;
}

// 3. Shape of items in the master catalogue (for dropdowns / discovery)
export interface IResourceCatalogueItem {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
}
