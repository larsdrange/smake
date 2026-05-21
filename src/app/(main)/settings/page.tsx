"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, LogOut } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useState(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return router.push("/login");
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      if (profile) {
        setDisplayName(profile.display_name ?? "");
        setBio(profile.bio ?? "");
        setAvatarPreview(profile.avatar_url);
      }
    });
  });

  function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let avatarUrl: string | undefined;

    if (avatarFile) {
      const path = `${user.id}/avatar.${avatarFile.name.split(".").pop()}`;
      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });
      if (uploadErr) { setError(uploadErr.message); setSaving(false); return; }
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      avatarUrl = urlData.publicUrl;
    }

    const { error: updateErr } = await supabase
      .from("profiles")
      .update({
        display_name: displayName || null,
        bio: bio || null,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      })
      .eq("id", user.id);

    if (updateErr) { setError(updateErr.message); }
    else { setSuccess(true); setTimeout(() => setSuccess(false), 3000); }
    setSaving(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <TopBar title="Innstillinger" />
      <div className="px-4 pt-4 pb-8 space-y-6">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar src={avatarPreview} alt={displayName || "Me"} size={80} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-gradient text-white rounded-full flex items-center justify-center shadow-brand-glow-sm"
              >
                <Camera size={14} />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onAvatarChange}
              className="hidden"
            />
          </div>

          <Input
            label="Visningsnavn"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ditt navn"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/60">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Fortell om deg selv..."
              rows={3}
              className="w-full px-4 py-3 text-sm bg-white/06 border border-white/10 rounded-xl outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/15 resize-none text-white/90 placeholder:text-white/25"
            />
          </div>

          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</p>}
          {success && <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 p-3 rounded-xl">Profil lagret!</p>}

          <Button type="submit" className="w-full" loading={saving}>
            Lagre endringer
          </Button>
        </form>

        <div className="border-t border-white/08 pt-4">
          <Button
            type="button"
            variant="ghost"
            className="w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
            onClick={handleSignOut}
          >
            <LogOut size={16} />
            Logg ut
          </Button>
        </div>
      </div>
    </>
  );
}
