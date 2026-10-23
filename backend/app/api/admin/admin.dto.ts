// Shape of hospital row displayed in Admin Verification Queue
export interface IPendingHospitalItem {
  hospital_id: string;
  hospital_name: string;
  licence_number: string;
  address: string;
  pincode: string;
  hospital_lat: number;
  hospital_long: number;
  status: boolean;
  is_active: boolean;
  created_at: Date | string;
  email: string;
  state_id: number;
  state_name: string;
  district_id: number;
  district_name: string;
}

// Query parameters for filtering all hospitals
export interface IHospitalFilterQuery {
  status?: boolean;
  state_id?: number;
  district_id?: number;
  search?: string;
}
