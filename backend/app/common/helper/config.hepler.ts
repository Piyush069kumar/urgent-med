import dotenv from "dotenv";
import process from "process";
import path from "path";

export const loadConfig = () => {
	const nodeEnv = process.env.NODE_ENV ?? "";
	const cwd = process.cwd();
	const defaultEnvPath = path.join(cwd, ".env");
	// Load base .env first
	dotenv.config({ path: defaultEnvPath });
	// Optionally overlay environment-specific file like .env.development or .env.production
	if (nodeEnv) {
		const envSpecificPath = path.join(cwd, `.env.${nodeEnv}`);
		dotenv.config({ path: envSpecificPath });
	}
};
