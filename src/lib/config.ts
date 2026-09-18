// =========================================================
// Central school configuration.
// Change these values to rebrand the system for another school.
// =========================================================

export const SCHOOL_NAME = "Mount Olivet Methodist Academy";
export const SCHOOL_SHORT_NAME = "MOMA";
export const SCHOOL_LOCATION = "Dansoman, Accra";
export const SCHOOL_TAGLINE = "Your Vote, Your Future, Your Voice";
export const SCHOOL_MOTTO = "The Truth Stands";
export const SCHOOL_LOGO_PATH = "/images/logo.png";

export const ELECTION_ANNOUNCEMENT_TEXT = `Thank you for participating in the ${SCHOOL_NAME} elections. Your vote has been securely recorded.`;

export const SESSION_COOKIE = {
  admin: "moma_admin_session",
  student: "moma_student_session",
} as const;
