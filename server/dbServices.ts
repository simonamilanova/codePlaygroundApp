import dbClient from "./db";

export const doesUserExist = async (username: string, password: string) => {
  try {
    const result = await dbClient.query(
      "SELECT COUNT(*) FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );
    
    return result.rows[0].count > 0;
  } catch (error) {
    console.error("Error checking if username exists:", error);
    throw new Error("Database query failed");
  }
};

export const addUser = async (id: string, username: string, code: string, password: string) => {
  try {
    await dbClient.query(
      "INSERT INTO users (id, username, code, password) VALUES ($1, $2, $3, $4)",
      [id, username, code, password]
    );
  } catch (error) {
    console.error("Error adding user:", error);
    throw new Error("Database insert failed");
  }
};

export const updateUserCode = async (username: string, code: string, language: string) => {
  try {
    await dbClient.query("SELECT * FROM users WHERE username = $1", [username]);

    await dbClient.query(
      "UPDATE users SET code = $1, language = $2 WHERE username = $3",
      [code, language, username]
    );

    const updatedUserResult = await dbClient.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    return updatedUserResult.rows[0];
  } catch (error) {
    console.error("Error updating user code:", error);
    throw new Error("Internal Server Error");
  }
};

export const getUser = async (username: string) => {
  try {
    let result = await dbClient.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    return result;
  } catch (error) {
    console.error("Error updating user code:", error);
    throw new Error("Internal Server Error");
  }
};
