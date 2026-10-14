import { pool } from "../../common/services/sql.service";
import {
  IUpsertHospitalResourceDTO,
  IHospitalResourceItem,
  IResourceCatalogueItem,
} from "./resource.dto";

/**
 * 1. Fetch master catalogue (all resources grouped with their category)
 * Used by dropdowns and public resource discovery
 */
export const getMasterCatalogue = async (): Promise<IResourceCatalogueItem[]> => {
  const query = `
    SELECT 
      r.id,
      r.name,
      rc.id AS category_id,
      rc.name AS category_name
    FROM resource r
    JOIN resource_category rc ON rc.id = r.resource_category_id
    ORDER BY rc.name ASC, r.name ASC;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

/**
 * 2. Fetch inventory for a specific hospital
 * Used by hospital dashboard and common users
 */
export const getHospitalInventory = async (
  hospitalId: string
): Promise<IHospitalResourceItem[]> => {
  const query = `
    SELECT 
      hr.id,
      hr.hospital_id,
      hr.resource_id,
      r.name AS resource_name,
      rc.id AS category_id,
      rc.name AS category_name,
      hr.quantity,
      hr.is_available,
      hr.updated_at
    FROM hospital_resource hr
    JOIN resource r ON r.id = hr.resource_id
    JOIN resource_category rc ON rc.id = r.resource_category_id
    WHERE hr.hospital_id = $1
    ORDER BY rc.name ASC, r.name ASC;
  `;
  const { rows } = await pool.query(query, [hospitalId]);
  return rows;
};

/**
 * 3. Atomic Upsert for Hospital Resource
 * Handles both adding a new resource and updating existing quantity/availability
 * Risk 1 Guard: If quantity is 0, is_available is strictly forced to false
 */
export const upsertHospitalResource = async (
  hospitalId: string,
  data: IUpsertHospitalResourceDTO
) => {
  let isAvailable = data.is_available ?? true;
  if (data.quantity === 0) {
    isAvailable = false;
  }

  const query = `
    INSERT INTO hospital_resource (
      hospital_id,
      resource_id,
      quantity,
      is_available,
      updated_at
    )
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    ON CONFLICT (hospital_id, resource_id)
    DO UPDATE SET
      quantity = EXCLUDED.quantity,
      is_available = EXCLUDED.is_available,
      updated_at = CURRENT_TIMESTAMP
    RETURNING id, hospital_id, resource_id, quantity, is_available, updated_at;
  `;

  const values = [hospitalId, data.resource_id, data.quantity, isAvailable];
  const { rows } = await pool.query(query, values);
  return rows[0];
};
