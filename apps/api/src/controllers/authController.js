import bcrypt from "bcryptjs";
import { query } from "../config/mysql.js";
import { generateToken } from "../utils/generateToken.js";
import { generateOtp } from "../utils/generateOtp.js";
import { normalizeRole, roleLabel } from "../utils/roles.js";
import { sendResetOtpEmail } from "../utils/sendResetOtpEmail.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = String(email || "").toLowerCase().trim();
    const existing = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [normalizedEmail]);
    if (existing.length) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      "INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, 'admin', 1)",
      [name, normalizedEmail, hashedPassword]
    );

    const userId = result.insertId;

    const token = generateToken({ id: String(userId), email: normalizedEmail });

    const normalizedRole = normalizeRole("admin");

    res.status(201).json({
      token,
      user: {
        id: String(userId),
        name,
        email: normalizedEmail,
        role: "admin",
        normalizedRole,
        roleLabel: roleLabel(normalizedRole)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();
    const rows = await query(
      "SELECT id, name, email, role, is_active, password_hash FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );
    const user = rows[0];

    if (!user || Number(user.is_active) !== 1) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ id: String(user.id), email: user.email });

    const normalizedRole = normalizeRole(user.role);

    res.json({
      token,
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        normalizedRole,
        roleLabel: roleLabel(normalizedRole)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();
    const rows = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [normalizedEmail]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await query("UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL", [
      user.id
    ]);

    await query(
      "INSERT INTO password_resets (user_id, otp_code, expires_at) VALUES (?, ?, ?)",
      [user.id, otp, expiresAt]
    );

    const emailResult = await sendResetOtpEmail({ email: normalizedEmail, otp });

    res.json({
      message: `OTP sent for ${normalizedEmail}`,
      sentTo: `${emailResult.sentTo} (testing mode)`
    });
  } catch (error) {
    res.status(500).json({ message: "Request failed", error: error.message });
  }
};

export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();
    const normalizedOtp = String(otp || "")
      .trim()
      .replace(/\s+/g, "")
      .replace(/[^0-9]/g, "");

    const users = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [normalizedEmail]);
    const user = users[0];

    if (!user) {
      return res.status(400).json({ message: "Invalid reset request" });
    }

    const otpRows = await query(
      `
      SELECT id, otp_code, expires_at, used_at
      FROM password_resets
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [user.id]
    );
    const otpRow = otpRows[0];

    if (!otpRow || otpRow.used_at || new Date() > new Date(otpRow.expires_at)) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const savedOtp = String(otpRow.otp_code || "").trim();
    if (!normalizedOtp || normalizedOtp !== savedOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await query("UPDATE users SET password_hash = ? WHERE id = ?", [hashedPassword, user.id]);
    await query("UPDATE password_resets SET used_at = NOW() WHERE id = ?", [otpRow.id]);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Reset failed", error: error.message });
  }
};

export const me = async (req, res) => {
  const rows = await query(
    "SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
    [req.user.id]
  );

  const user = rows[0];
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const normalizedRole = normalizeRole(user.role);

  return res.json({
    user: {
      id: String(user.id),
      _id: String(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      normalizedRole,
      roleLabel: roleLabel(normalizedRole),
      isActive: Boolean(user.is_active),
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }
  });
};

export const updateMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, currentPassword, newPassword } = req.body;

    const rows = await query(
      "SELECT id, name, email, role, is_active, password_hash, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
      [userId]
    );
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const normalizedEmail = email !== undefined ? String(email || "").toLowerCase().trim() : user.email;

    if (email !== undefined && normalizedEmail !== user.email) {
      const existing = await query("SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1", [
        normalizedEmail,
        userId
      ]);
      if (existing.length) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    let passwordHash = user.password_hash;
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }

      const isMatch = await bcrypt.compare(String(currentPassword), user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      if (String(newPassword).length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
      }

      passwordHash = await bcrypt.hash(String(newPassword), 10);
    }

    await query(
      `
      UPDATE users
      SET name = ?,
          email = ?,
          password_hash = ?
      WHERE id = ?
      `,
      [name !== undefined ? String(name).trim() : user.name, normalizedEmail, passwordHash, userId]
    );

    const updatedRows = await query(
      "SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
      [userId]
    );
    const updated = updatedRows[0];
    const normalizedRole = normalizeRole(updated.role);

    return res.json({
      message: "Profile updated successfully",
      user: {
        id: String(updated.id),
        _id: String(updated.id),
        name: updated.name,
        email: updated.email,
        role: updated.role,
        normalizedRole,
        roleLabel: roleLabel(normalizedRole),
        isActive: Boolean(updated.is_active),
        createdAt: updated.created_at,
        updatedAt: updated.updated_at
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};