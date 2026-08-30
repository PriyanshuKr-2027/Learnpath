"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { 
  Users, 
  ChatCircle, 
  Shield, 
  CheckCircle, 
  PlayCircle, 
  Sparkle, 
  MagnifyingGlass, 
  ArrowSquareOut,
  Plus,
  Trash,
  X
} from "@phosphor-icons/react";
import { getUserProgressList } from "@/lib/store";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { StreamChat } from "stream-chat";

const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY || "mnmv54a3xea4";

export default function AdminPage() {
  const { supabase, isMockMode, createPortalUser, deletePortalUser, days, user: currentUser } = useSupabase();
  const [activeTab, setActiveTab] = useState<"users" | "chats">("users");
  const cleanupTimeoutRef = useRef<any>(null);
  
  // Real or mock users progression
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Create User Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Real-time Chat Monitor state
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [activeChannel, setActiveChannel] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isChatConnecting, setIsChatConnecting] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Search filter
  const [searchUser, setSearchUser] = useState("");

  // Load Users Progress Data (Real or Mock)
  useEffect(() => {
    if (isMockMode) {
      setUsers(getUserProgressList());
      return;
    }

    const fetchRealUsers = async () => {
      setLoadingUsers(true);
      try {
        // Fetch all profiles
        const { data: profiles, error: profilesErr } = await supabase!
          .from("profiles")
          .select("*");
        if (profilesErr) throw profilesErr;

        // Fetch all progress (solved problems)
        const { data: progress, error: progressErr } = await supabase!
          .from("progress")
          .select("user_id, problem_id");
        if (progressErr) throw progressErr;

        // Compute total problems from days
        const totalProblems = days.reduce((sum, day) => sum + (day.problems?.length || 0), 0);

        // Map database profiles to users table schema
        const mappedUsers = (profiles || []).map(p => {
          const userProgress = (progress || []).filter(pr => pr.user_id === p.id);
          const solvedCount = userProgress.length;
          const percentage = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;
          const joinedDate = new Date(p.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          });

          return {
            id: p.id,
            name: p.name,
            email: p.email,
            role: p.role,
            joinedDate,
            lastActive: p.last_active_date || " - ",
            solvedCount,
            totalProblems,
            percentage,
            avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${p.name}`
          };
        });

        setUsers(mappedUsers);
      } catch (err) {
        console.error("Error fetching real user data:", err);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (days.length > 0) {
      fetchRealUsers();
    }
  }, [isMockMode, supabase, days, refreshTrigger]);

  // Create User Handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword || !newUserName) return;

    setIsCreatingUser(true);
    try {
      await createPortalUser(newUserEmail, newUserPassword, newUserName);
      setShowCreateModal(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      alert(err.message || "Failed to create user.");
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Delete User Handler
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (isMockMode) {
      alert("User deletion is simulated in mock mode. Add Supabase keys to delete from real DB.");
      return;
    }
    if (currentUser && currentUser.id === userId) {
      alert("You cannot delete your own admin account.");
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete user "${userName}"? This will erase their profile and all problem-solving progress.`)) {
      return;
    }
    try {
      await deletePortalUser(userId);
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      alert(err.message || "Failed to delete user.");
    }
  };

  // StreamChat Administration Client Connection
  useEffect(() => {
    if (activeTab !== "chats") return;

    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
      cleanupTimeoutRef.current = null;
    }
    
    setIsChatConnecting(true);
    setChatError(null);
    const client = StreamChat.getInstance(STREAM_API_KEY);

    const initAdminChat = async () => {
      try {
        const tokenRes = await fetch(`/api/stream-token?userId=admin`);
        const tokenData = await tokenRes.json();
        let token = tokenData.token;
        if (!token) {
          console.warn("STREAM_API_SECRET is not configured in .env.local. Falling back to devToken.");
          token = client.devToken("admin");
        }
        
        if (client.userID !== "admin") {
          if (client.userID) {
            await client.disconnectUser();
          }
          await client.connectUser(
            {
              id: "admin",
              name: "System Administrator",
              image: "https://api.dicebear.com/7.x/bottts/svg?seed=admin"
            },
            token
          );
        }
        setChatClient(client);

        const filter = { type: "messaging", members: { $in: ["admin"] } };
        const sort: any = { last_message_at: "desc" };
        const queriedChannels = await client.queryChannels(filter, sort, {
          watch: true,
          state: true
        } as any);
        
        setChannels(queriedChannels);
        setIsChatConnecting(false);

        client.on("message.new", (event) => {
          client.queryChannels(filter, sort).then(setChannels);
        });

      } catch (err: any) {
        console.error("Admin Stream connection error:", err);
        setChatError(err.message || "Could not connect to Stream Chat service.");
        setIsChatConnecting(false);
      }
    };

    initAdminChat();

    return () => {
      cleanupTimeoutRef.current = setTimeout(async () => {
        if (client) {
          try {
            await client.disconnectUser();
            console.log("Admin chat client disconnected successfully");
          } catch (e) {
            console.error("Error disconnecting admin chat client:", e);
          }
        }
      }, 500);
    };
  }, [activeTab]);

  // Monitor channel message list
  useEffect(() => {
    if (!activeChannel) {
      setChatMessages([]);
      return;
    }

    setChatMessages(activeChannel.state.messages || []);

    const handleNewMessage = (event: any) => {
      if (event.channel_id === activeChannel.id) {
        setChatMessages((prev) => [...prev, event.message]);
      }
    };

    activeChannel.on("message.new", handleNewMessage);
    return () => {
      activeChannel.off("message.new", handleNewMessage);
    };
  }, [activeChannel]);

  // Statistics Computations
  const stats = useMemo(() => {
    if (users.length === 0) return { total: 0, avgProgress: 0, active: 0, totalSolved: 0 };
    const total = users.length;
    const avgProgress = Math.round(users.reduce((sum, u) => sum + u.percentage, 0) / total);
    const active = users.filter(u => {
      if (!u.lastActive || u.lastActive === " - ") return false;
      const lastActiveDate = new Date(u.lastActive);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return lastActiveDate >= oneWeekAgo;
    }).length;
    const totalSolved = users.reduce((sum, u) => sum + u.solvedCount, 0);
    return { total, avgProgress, active, totalSolved };
  }, [users]);

  // Filters
  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
    );
  }, [users, searchUser]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-4">
      {/* Admin Title */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield weight="fill" className="text-focus w-8 h-8" /> Administrator Console
          </h1>
          <p className="text-text-secondary text-sm">Monitor user progression, create/delete learner accounts, and audit real-time chat networks.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-focus text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create User
        </button>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-border bg-surface p-1 rounded-xl shadow-sm max-w-xs">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "users"
              ? "bg-focus text-white shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <Users className="w-4 h-4" /> Users & Progress
        </button>
        <button
          onClick={() => setActiveTab("chats")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "chats"
              ? "bg-focus text-white shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <ChatCircle className="w-4 h-4" /> Chat Monitor
        </button>
      </div>

      {/* TAB 1: USERS & PROGRESS */}
      {activeTab === "users" && (
        <div className="space-y-8">
          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="p-3 bg-focus/10 rounded-xl text-focus"><Users className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Total Users</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
            <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="p-3 bg-signal/10 rounded-xl text-signal"><CheckCircle className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Avg Completion</p>
                <p className="text-xl font-bold">{stats.avgProgress}%</p>
              </div>
            </div>
            <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-xl text-warning"><Sparkle className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Active This Week</p>
                <p className="text-xl font-bold">{stats.active}</p>
              </div>
            </div>
            <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="p-3 bg-alert/10 rounded-xl text-alert"><PlayCircle className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Problems Solved</p>
                <p className="text-xl font-bold">{stats.totalSolved}</p>
              </div>
            </div>
          </div>

          {/* User List Panel */}
          <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-bold text-sm">Platform Users Progress Directory</h3>
              <div className="relative max-w-xs w-full">
                <MagnifyingGlass className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search users by name/email..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-paper border border-border focus:outline-none focus:ring-2 focus:ring-focus/20 text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase">User Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase">Joined Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase">Last Active</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase">Progress</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase w-36 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-xs text-text-secondary">
                        Loading database users progress...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-xs text-text-secondary">
                        No registered users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-paper/20 transition-all">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full bg-paper p-0.5 border border-border" />
                          <div>
                            <p className="font-bold text-text-primary">{user.name}</p>
                            <p className="text-xs text-text-secondary font-mono">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize border ${
                            user.role === "admin" 
                              ? "bg-focus/10 border-focus/20 text-focus" 
                              : "bg-gray-100 border-border text-text-secondary"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-text-secondary text-xs">{user.joinedDate}</td>
                        <td className="px-6 py-4 text-text-secondary text-xs font-mono">{user.lastActive}</td>
                        <td className="px-6 py-4">
                          <div className="space-y-1 max-w-[200px]">
                            <div className="flex justify-between text-xs font-bold">
                              <span>{user.percentage}%</span>
                              <span className="text-text-secondary font-mono">{user.solvedCount}/{user.totalProblems}</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-signal h-full rounded-full" style={{ width: `${user.percentage}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="px-2.5 py-1.5 bg-paper hover:bg-border text-text-primary text-xs font-semibold rounded-lg border border-border transition-all flex items-center gap-1 shrink-0"
                            >
                              View <ArrowSquareOut className="w-3.5 h-3.5" />
                            </Link>
                            {user.role !== "admin" && (
                              <button
                                onClick={() => handleDeleteUser(user.id, user.name)}
                                className="p-2 text-text-secondary hover:text-alert bg-paper hover:bg-alert/5 border border-border hover:border-alert/20 rounded-lg transition-all cursor-pointer"
                                title="Delete User Account"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REAL-TIME CHAT MONITOR */}
      {activeTab === "chats" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px] items-stretch">
          {/* Chat List (Left) */}
          <div className="lg:col-span-4 bg-surface border border-border rounded-2xl flex flex-col overflow-hidden shadow-sm h-full">
            <div className="p-4 border-b border-border bg-gray-50/50">
              <h3 className="font-bold text-xs uppercase text-text-secondary tracking-wider">Live Chat Channels</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
              {isChatConnecting ? (
                <div className="text-center py-12 text-xs text-text-secondary flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-focus border-t-transparent rounded-full animate-spin"></div>
                  Connecting Stream Administrator...
                </div>
              ) : chatError ? (
                <div className="text-center text-xs text-alert bg-alert/5 p-4 rounded-xl border border-alert/20">
                  {chatError}
                </div>
              ) : channels.length === 0 ? (
                <div className="text-center text-xs text-text-secondary py-12">
                  No active real-time channels found on server.
                </div>
              ) : (
                channels.map((chan) => {
                  const channelName = chan.data?.name || chan.id;
                  const lastMessage = chan.state.messages[chan.state.messages.length - 1];
                  const filteredMembers = Object.values(chan.state.members)
                    .map((m: any) => m.user?.name || m.user_id)
                    .filter((name) => name !== "System Administrator" && name !== "admin");

                  return (
                    <div
                      key={chan.id}
                      onClick={() => setActiveChannel(chan)}
                      className={`p-3 rounded-xl border border-border hover:bg-paper/40 cursor-pointer transition-all ${
                        activeChannel?.id === chan.id ? "bg-focus/5 border-focus/30" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-text-primary truncate max-w-[170px]">
                          {filteredMembers.join(" & ") || channelName}
                        </p>
                        <span className="text-[9px] font-semibold bg-gray-100 text-text-secondary px-2 py-0.5 rounded-full">
                          Live
                        </span>
                      </div>
                      <p className="text-[10px] text-text-secondary font-medium mt-1.5 truncate">
                        {lastMessage ? `${lastMessage.user?.name || 'User'}: ${lastMessage.text}` : "No messages yet"}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Transcript Viewer (Right) */}
          <div className="lg:col-span-8 bg-surface border border-border rounded-2xl flex flex-col overflow-hidden shadow-sm h-full relative">
            {activeChannel ? (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-border bg-gray-50/50 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-text-primary">
                      Audit Stream: {Object.values(activeChannel.state.members)
                        .map((m: any) => m.user?.name || m.user_id)
                        .filter((n) => n !== "admin" && n !== "System Administrator")
                        .join(" & ") || activeChannel.data?.name}
                    </h4>
                    <p className="text-[10px] text-text-secondary">Channel Key: {activeChannel.id} (Monitoring Mode)</p>
                  </div>
                  <span className="px-2.5 py-1 bg-green-50 text-signal border border-signal/20 rounded-full text-[10px] font-bold animate-pulse">
                    Real-time Audit
                  </span>
                </div>

                {/* Messages feed */}
                <div className="flex-1 overflow-y-auto p-5 bg-paper/20 space-y-4">
                  {chatMessages.length === 0 ? (
                    <p className="text-center text-xs text-text-secondary py-12">No messages sent in this channel.</p>
                  ) : (
                    chatMessages.map((msg, idx) => {
                      const isSenderAdmin = msg.user?.id === "admin";
                      return (
                        <div key={idx} className={`flex flex-col max-w-[75%] ${isSenderAdmin ? "ml-auto items-end" : "mr-auto items-start"}`}>
                          <span className="text-[9px] text-text-secondary font-bold mb-1">{msg.user?.name || msg.user?.id}</span>
                          <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isSenderAdmin ? "bg-focus text-white" : "bg-surface text-text-primary border border-border"
                          }`}>
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-text-secondary mt-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="p-3.5 bg-paper border border-border rounded-xl text-text-secondary"><ChatCircle className="w-8 h-8" /></div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">Real-time Stream Monitor</h4>
                  <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                    Select an active channel from the left sidebar to audit the conversations of users in real-time.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-border w-full max-w-md p-6 rounded-2xl shadow-xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Users weight="fill" className="text-focus w-5 h-5" /> Create New Learner Account
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-text-secondary hover:text-text-primary hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prince Kumot"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-paper border border-border focus:ring-2 focus:ring-focus/20 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. prince@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-paper border border-border focus:ring-2 focus:ring-focus/20 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Account Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-paper border border-border focus:ring-2 focus:ring-focus/20 focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingUser}
                className="w-full py-2.5 bg-focus text-white font-bold rounded-lg text-xs hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                {isCreatingUser ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </>
                ) : (
                  <>Create Account</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
