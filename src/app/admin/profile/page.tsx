"use client";

import { useEffect, useState } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { useAuth } from "@/lib/useAuth";
import { getProfile, saveProfile, uploadAvatar } from "@/lib/profiles";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado.";
}

export default function ProfilePage() {
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [photoURL, setPhotoURL] = useState<string | undefined>(undefined);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const [emailPassword, setEmailPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getProfile(user.uid).then((profile) => {
      setDisplayName(profile?.displayName ?? user.displayName ?? "");
      setBio(profile?.bio ?? "");
      setPhotoURL(profile?.photoURL ?? user.photoURL ?? undefined);
    });
  }, [user]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setProfileMessage(null);
    try {
      const uploadedUrl = avatarFile ? await uploadAvatar(user.uid, avatarFile) : photoURL;
      await saveProfile(user.uid, { displayName, bio, photoURL: uploadedUrl });
      await updateProfile(user, { displayName, photoURL: uploadedUrl ?? null });
      setPhotoURL(uploadedUrl);
      setAvatarFile(null);
      setProfileMessage("Perfil actualizado.");
    } catch (error: unknown) {
      setProfileMessage(getErrorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !user.email) return;
    setSavingEmail(true);
    setEmailError(null);
    setEmailMessage(null);
    try {
      const credential = EmailAuthProvider.credential(user.email, emailPassword);
      await reauthenticateWithCredential(user, credential);
      await verifyBeforeUpdateEmail(user, newEmail);
      setEmailMessage(`Te enviamos un correo de confirmación a ${newEmail}. El cambio se aplica una vez que lo confirmes.`);
      setEmailPassword("");
      setNewEmail("");
    } catch (error: unknown) {
      setEmailError(getErrorMessage(error));
    } finally {
      setSavingEmail(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !user.email) return;
    setPasswordError(null);
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas nuevas no coinciden.");
      return;
    }
    setSavingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordMessage("Contraseña actualizada.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      setPasswordError(getErrorMessage(error));
    } finally {
      setSavingPassword(false);
    }
  }

  if (!user) return null;

  return (
    <>
      <div className="admin-head">
        <h2>Perfil</h2>
      </div>

      <form onSubmit={handleProfileSubmit} style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div
            className="profile-avatar"
            style={avatarPreview || photoURL ? { backgroundImage: `url(${avatarPreview ?? photoURL})` } : undefined}
          >
            {!avatarPreview && !photoURL && (displayName || user.email || "?").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <label htmlFor="avatar" className="btn" style={{ cursor: "pointer" }}>
              Cambiar foto
            </label>
            <input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="displayName">Nombre para mostrar</label>
          <input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
        </div>

        <div className="field">
          <label htmlFor="bio">Sobre vos</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Un par de líneas sobre vos como cervecero…"
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20 }}>
          <button className="btn primary" type="submit" disabled={savingProfile}>
            {savingProfile ? "Guardando…" : "Guardar perfil"}
          </button>
          {profileMessage && <span style={{ fontSize: ".82rem", color: "var(--ink-dim)" }}>{profileMessage}</span>}
        </div>
      </form>

      <div className="section-head" style={{ padding: "0 0 4px" }}>
        <h3>Cambiar correo electrónico</h3>
      </div>
      <p style={{ color: "var(--ink-dim)", fontSize: ".82rem", marginTop: 4 }}>Correo actual: {user.email}</p>
      <form onSubmit={handleEmailSubmit} style={{ marginBottom: 40 }}>
        <div className="field-row">
          <div className="field">
            <label htmlFor="newEmail">Correo nuevo</label>
            <input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="emailPassword">Contraseña actual</label>
            <input
              id="emailPassword"
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
          <button className="btn primary" type="submit" disabled={savingEmail}>
            {savingEmail ? "Enviando…" : "Actualizar correo"}
          </button>
          {emailMessage && <span style={{ fontSize: ".82rem", color: "var(--ink-dim)" }}>{emailMessage}</span>}
        </div>
        {emailError && <p className="error-text" style={{ textAlign: "left" }}>{emailError}</p>}
      </form>

      <div className="section-head" style={{ padding: "0 0 4px" }}>
        <h3>Cambiar contraseña</h3>
      </div>
      <form onSubmit={handlePasswordSubmit}>
        <div className="field-row">
          <div className="field">
            <label htmlFor="currentPassword">Contraseña actual</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="newPassword">Contraseña nueva</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Confirmar contraseña nueva</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
          <button className="btn primary" type="submit" disabled={savingPassword}>
            {savingPassword ? "Guardando…" : "Actualizar contraseña"}
          </button>
          {passwordMessage && <span style={{ fontSize: ".82rem", color: "var(--ink-dim)" }}>{passwordMessage}</span>}
        </div>
        {passwordError && <p className="error-text" style={{ textAlign: "left" }}>{passwordError}</p>}
      </form>
    </>
  );
}
