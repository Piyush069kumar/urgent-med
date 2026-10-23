import { pool } from "../../common/services/sql.service";
import { IPendingHospitalItem, IHospitalFilterQuery } from "./admin.dto";

/**
 * 1. Fetch all hospitals awaiting verification (status = FALSE)
 */
export const getPendingHospitals = async (): Promise<IPendingHospitalItem[]> => {
  const query = `
    SELECT 
      h.id AS hospital_id,
      h.hospital_name,
      h.licence_number,
      h.address,
      h.pincode,
      h.hospital_lat,
      h.hospital_long,
      h.status,
      h.is_active,
      h.created_at,
      c.email,
      s.id AS state_id,
      s.name AS state_name,
      d.id AS district_id,
      d.name AS district_name
    FROM hospital h
    JOIN credential c ON c.id = h.credential_id
    JOIN state s ON s.id = h.state_id
    JOIN district d ON d.id = h.district_id
    WHERE h.status = FALSE AND h.is_active = TRUE
    ORDER BY h.created_at ASC;
  `;

  const { rows } = await pool.query(query);
  return rows;
};

/**
 * 2. Fetch all hospitals with optional status, state, or name search
 */
export const getAllHospitals = async (filters: IHospitalFilterQuery) => {
  let baseQuery = `
    SELECT 
      h.id AS hospital_id,
      h.hospital_name,
      h.licence_number,
      h.address,
      h.pincode,
      h.hospital_lat,
      h.hospital_long,
      h.status,
      h.is_active,
      h.created_at,
      c.email,
      s.name AS state_name,
      d.name AS district_name
    FROM hospital h
    JOIN credential c ON c.id = h.credential_id
    JOIN state s ON s.id = h.state_id
    JOIN district d ON d.id = h.district_id
    WHERE 1=1
  `;

  const values: any[] = [];
  let paramIndex = 1;

  if (typeof filters.status === "boolean") {
    baseQuery += ` AND h.status = $${paramIndex++}`;
    values.push(filters.status);
  }

  if (filters.state_id) {
    baseQuery += ` AND h.state_id = $${paramIndex++}`;
    values.push(filters.state_id);
  }

  if (filters.district_id) {
    baseQuery += ` AND h.district_id = $${paramIndex++}`;
    values.push(filters.district_id);
  }

  if (filters.search) {
    baseQuery += ` AND (h.hospital_name ILIKE $${paramIndex} OR h.licence_number ILIKE $${paramIndex})`;
    values.push(`%${filters.search}%`);
    paramIndex++;
  }

  baseQuery += ` ORDER BY h.hospital_name ASC;`;

  const { rows } = await pool.query(baseQuery, values);
  return rows;
};

/**
 * 3. Approve and verify a hospital (status = TRUE)
 */
export const verifyHospital = async (hospitalId: string) => {
  const query = `
    UPDATE hospital
    SET status = TRUE, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, hospital_name, licence_number, status, updated_at;
  `;
  const { rows } = await pool.query(query, [hospitalId]);
  return rows.length > 0 ? rows[0] : null;
};

/**
 * 4. Reject / Deactivate a hospital
 */
export const rejectHospital = async (hospitalId: string) => {
  const query = `
    UPDATE hospital
    SET status = FALSE, is_active = FALSE, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, hospital_name, licence_number, status, is_active, updated_at;
  `;
  const { rows } = await pool.query(query, [hospitalId]);
  return rows.length > 0 ? rows[0] : null;
};
