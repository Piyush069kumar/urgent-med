// 1. Roles matching Postgres enum 'user_role'
export type UserRole = "admin" | "hospital_admin";

// 2. Represents a record in the 'credential' table
export interface ICredential {
  id: string; // UUID
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

// 3. Represents a record in the 'hospital' table
export interface IHospital {
  id: string; // UUID
  email: string;
  hospital_name: string;
  licence_number: string;
  address: string;
  district_id: number;
  state_id: number;
  pincode: string;
  hospital_lat: number;
  hospital_long: number;
  is_active: boolean;
  status: boolean; // FALSE = pending verification, TRUE = approved by admin
  credential_id: string; // Foreign key to credential.id
  created_at?: Date | string;
  updated_at?: Date | string;
}

// 4. Request payload sent by hospital during registration
export interface IHospitalRegisterDTO {
  // Credentials
  password: string;
  email:string;
  // Hospital details
  hospital_name: string;
  licence_number: string;
  address: string;
  state_id: number;
  district_id: number;
  pincode: string;
  hospital_lat: number;
  hospital_long: number;
}

// 5. Request payload for login
export interface ILoginDTO {
  email: string;
  password: string;
}

// 6. Decoded JWT token payload attached to req.user
export interface IAuthUser {
  id: string; // credential.id
  email: string;
  role: UserRole;
  hospital_id?: string;
  hospital_name?: string;
  hospital_status?: boolean; // false = pending, true = approved
}
export interface ICredentialWithHospital extends ICredential {
  hospital_id?: string;
  hospital_name?: string;
  hospital_status?: boolean;
}