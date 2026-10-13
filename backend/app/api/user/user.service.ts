import { pool } from "../../common/services/sql.service";
import { IHospitalRegisterDTO, ICredential, IHospital, ILoginDTO , ICredentialWithHospital} from "./user.dto";
import { type RowDataPacket, type ResultSetHeader } from "mysql2";
import { hash, compare } from "bcrypt";

export const getActiveUserByEmail = async (
  email: string
): Promise<ICredentialWithHospital | null> => {
  try {
    const query = `
      SELECT 
        c.id,
        c.email,
        c.password_hash,
        c.role,
        c.is_active,
        c.created_at,
        h.id AS hospital_id,
        h.hospital_name,
        h.status AS hospital_status
      FROM credential c
      LEFT JOIN hospital h ON h.credential_id = c.id
      WHERE c.email = $1 AND c.is_active = TRUE
      LIMIT 1;
    `;
    const { rows } = await pool.query(query, [email]);
    return rows.length > 0 ? (rows[0] as ICredentialWithHospital) : null;
  } catch (err) {
    console.error("Error fetching user by email:", err);
    return null;
  }
};


/**
 * Creates a new hospital user
 * @param data Hospital registration data
 * @returns Hospital profile with status (false = pending approval)
 */
export const createHospitalUser = async (data: IHospitalRegisterDTO) => {
  const { email, password, ...hospitalData } = data;

  // 1. Acquire a dedicated client from the pool for the transaction
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 2. Hash password and insert into credential (role is strictly 'hospital_admin')
    const hashedPassword = await hash(password, 10);
    const credentialQuery = `
      INSERT INTO credential (email, password_hash, role, is_active)
      VALUES ($1, $2, 'hospital_admin', true)
      RETURNING id;
    `;
    const credentialResult = await client.query(credentialQuery, [
      email,
      hashedPassword,
    ]);
    const credentialId = credentialResult.rows[0].id;

    // 3. Insert hospital profile with PostGIS location (Note: Longitude first, then Latitude!)
    const hospitalQuery = `
      INSERT INTO hospital (
        hospital_name,
        licence_number,
        address,
        district_id,
        state_id,
        pincode,
        hospital_lat,
        hospital_long,
        location,
        status,
        credential_id
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        ST_SetSRID(ST_MakePoint($8, $7), 4326),
        false,
        $9
      )
      RETURNING id, hospital_name, status;
    `;

    const hospitalResult = await client.query(hospitalQuery, [
      hospitalData.hospital_name,
      hospitalData.licence_number,
      hospitalData.address,
      hospitalData.district_id,
      hospitalData.state_id,
      hospitalData.pincode,
      hospitalData.hospital_lat,
      hospitalData.hospital_long,
      credentialId,
    ]);

    // 4. Commit the transaction
    await client.query("COMMIT");

    return {
      success: true,
      message: "Hospital registered successfully. Awaiting admin approval.",
      hospital: hospitalResult.rows[0],
    };
  } catch (error: any) {
    // Rollback changes on any failure
    await client.query("ROLLBACK");

    // PostgreSQL unique constraint violation error code
    if (error.code === "23505") {
      if (error.constraint?.includes("credential_email_key") || error.detail?.includes("email")) {
        throw new Error("Email already registered");
      }
      if (error.constraint?.includes("licence_number") || error.detail?.includes("licence_number")) {
        throw new Error("Licence number already registered");
      }
    }
    throw error;
  } finally {
    // 5. Always release the client back to the pool
    client.release();
  }
};

export const verifyHospital = async (hospitalId: string) => {
  const query = `
    UPDATE hospital
    SET status = TRUE, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, hospital_name, status, updated_at;
  `;
  const { rows } = await pool.query(query, [hospitalId]);
  return rows.length > 0 ? rows[0] : null;
};