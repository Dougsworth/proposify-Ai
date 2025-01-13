"use client";

import { useState, useEffect } from "react";
import { Settings, Bell, Lock, User, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";

interface UserProfile {
  fullName: string;
  email: string;
  profilePicture?: string;
  notificationSettings: {
    newProposals: boolean;
    proposalUpdates: boolean;
    teamMentions: boolean;
    browserNotifications: boolean;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [profileData, setProfileData] = useState<UserProfile>({
    fullName: "",
    email: "",
    notificationSettings: {
      newProposals: false,
      proposalUpdates: false,
      teamMentions: false,
      browserNotifications: false,
    },
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (
    settingKey: keyof UserProfile["notificationSettings"]
  ) => {
    setProfileData((prev) => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [settingKey]: !prev.notificationSettings[settingKey],
      },
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("profilePicture", file);

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/api/user/profile-picture`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) throw new Error("Failed to upload profile picture");

        const data = await response.json();
        setProfileData((prev) => ({
          ...prev,
          profilePicture: data.profilePicture,
        }));
        setSuccess("Profile picture updated successfully");
      } catch (error) {
        setError("Failed to upload profile picture");
      }
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      if (activeTab === "security") {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        await fetch(`${BASE_URL}/api/user/password`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        });

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setSuccess("Password updated successfully");
      } else {
        const endpoint =
          activeTab === "profile"
            ? `${BASE_URL}/api/user/profile`
            : `${BASE_URL}/api/user/notifications`;
        const data =
          activeTab === "profile"
            ? { fullName: profileData.fullName, email: profileData.email }
            : { notificationSettings: profileData.notificationSettings };

        const response = await fetch(endpoint, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error("Failed to update settings");
        setSuccess("Settings saved successfully");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to save changes"
      );
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navigation />

      <div className="pt-16">
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <header className="flex items-center gap-3 mb-8">
            <Settings className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
              <p className="mt-2 text-lg text-gray-600">
                Manage your account preferences and configurations
              </p>
            </div>
          </header>

          {(error || success) && (
            <div
              className={`mb-4 p-4 rounded-md ${
                error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
              }`}
            >
              {error || success}
            </div>
          )}

          <div className="bg-white shadow-sm rounded-lg">
            <div className="border-b">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  { id: "profile", name: "Profile", icon: User },
                  { id: "notifications", name: "Notifications", icon: Bell },
                  { id: "security", name: "Security", icon: Lock },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-2" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {loading ? (
              <div className="p-6 flex justify-center">
                <div className="w-8 h-8 border-t-2 border-blue-600 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="p-6">
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Profile Picture
                      </label>
                      <div className="mt-2 flex items-center space-x-4">
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {profileData.profilePicture ? (
                            <img
                              src={profileData.profilePicture}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-10 h-10 text-gray-400" />
                          )}
                        </div>
                        <label className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors cursor-pointer">
                          Change
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={profileData.fullName}
                          onChange={handleProfileChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    {[
                      {
                        key: "newProposals",
                        label: "Email notifications for new proposals",
                      },
                      {
                        key: "proposalUpdates",
                        label: "Email notifications for proposal updates",
                      },
                      {
                        key: "teamMentions",
                        label: "Email notifications for team mentions",
                      },
                      {
                        key: "browserNotifications",
                        label: "Browser notifications",
                      },
                    ].map(({ key, label }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-700">{label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={
                              profileData.notificationSettings[
                                key as keyof UserProfile["notificationSettings"]
                              ]
                            }
                            onChange={() =>
                              handleNotificationChange(
                                key as keyof UserProfile["notificationSettings"]
                              )
                            }
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saveLoading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saveLoading ? (
                      <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2" />
                    ) : (
                      <Save className="w-5 h-5 mr-2" />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
