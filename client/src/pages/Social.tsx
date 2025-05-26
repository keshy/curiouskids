import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import type { Friendship, Group, User } from "@shared/schema";

interface FriendWithUser extends Friendship {
  friend: User;
}

interface GroupWithMembers extends Group {
  memberCount: number;
  isOwner: boolean;
  isMember: boolean;
}

export default function Social() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'friends' | 'groups' | 'shared'>('friends');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  // Fetch friends
  const { data: friends = [] } = useQuery<FriendWithUser[]>({
    queryKey: ['/api/friends'],
    enabled: !!user,
  });

  // Fetch groups
  const { data: groups = [] } = useQuery<GroupWithMembers[]>({
    queryKey: ['/api/groups'],
    enabled: !!user,
  });

  // Add friend mutation
  const addFriendMutation = useMutation({
    mutationFn: (email: string) => apiRequest(`/api/friends/invite`, {
      method: 'POST',
      body: { email },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      setFriendEmail('');
      setShowAddFriend(false);
    },
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: (groupData: { name: string; description: string }) => 
      apiRequest(`/api/groups`, {
        method: 'POST',
        body: groupData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      setGroupName('');
      setGroupDescription('');
      setShowCreateGroup(false);
    },
  });

  const handleAddFriend = () => {
    if (friendEmail.trim()) {
      addFriendMutation.mutate(friendEmail.trim());
    }
  };

  const handleCreateGroup = () => {
    if (groupName.trim()) {
      createGroupMutation.mutate({
        name: groupName.trim(),
        description: groupDescription.trim(),
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-purple-800 mb-2">Social Learning</h1>
              <p className="text-purple-600">Connect with friends and share your learning journey!</p>
            </div>
            <Link href="/">
              <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors">
                <i className="ri-home-line mr-2"></i>Back to Learning
              </button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl mb-6 border border-purple-200">
          <div className="flex">
            {(['friends', 'groups', 'shared'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 text-center font-semibold rounded-t-2xl transition-colors ${
                  activeTab === tab
                    ? 'bg-purple-500 text-white'
                    : 'bg-transparent text-purple-600 hover:bg-purple-100'
                }`}
              >
                <i className={`mr-2 ${
                  tab === 'friends' ? 'ri-user-heart-line' :
                  tab === 'groups' ? 'ri-group-line' :
                  'ri-share-line'
                }`}></i>
                {tab === 'friends' ? 'Friends' : tab === 'groups' ? 'Study Groups' : 'Shared Q&As'}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200">
          {activeTab === 'friends' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-purple-800">My Friends</h2>
                <button
                  onClick={() => setShowAddFriend(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <i className="ri-user-add-line mr-2"></i>Add Friend
                </button>
              </div>

              {friends.length === 0 ? (
                <div className="text-center py-12">
                  <i className="ri-user-heart-line text-6xl text-purple-300 mb-4"></i>
                  <p className="text-purple-600 text-lg">No friends yet! Invite some friends to start sharing knowledge.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map((friendship) => (
                    <div key={friendship.id} className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-xl border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <img
                          src={friendship.friend.photoUrl || '/default-avatar.png'}
                          alt={friendship.friend.displayName || 'Friend'}
                          className="w-12 h-12 rounded-full border-2 border-white"
                        />
                        <div>
                          <h3 className="font-semibold text-blue-900">{friendship.friend.displayName}</h3>
                          <p className="text-sm text-blue-600">{friendship.friend.username}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            friendship.status === 'accepted' ? 'bg-green-200 text-green-800' :
                            friendship.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-gray-200 text-gray-800'
                          }`}>
                            {friendship.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'groups' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-purple-800">Study Groups</h2>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <i className="ri-group-line mr-2"></i>Create Group
                </button>
              </div>

              {groups.length === 0 ? (
                <div className="text-center py-12">
                  <i className="ri-group-line text-6xl text-purple-300 mb-4"></i>
                  <p className="text-purple-600 text-lg">No study groups yet! Create or join a group to collaborate.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groups.map((group) => (
                    <div key={group.id} className="bg-gradient-to-r from-indigo-100 to-blue-100 p-6 rounded-xl border border-indigo-200">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-indigo-900 text-lg">{group.name}</h3>
                        {group.isOwner && (
                          <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full">Owner</span>
                        )}
                      </div>
                      <p className="text-indigo-700 mb-3">{group.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-indigo-600">
                          <i className="ri-user-line mr-1"></i>
                          {group.memberCount} members
                        </span>
                        <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm transition-colors">
                          View Group
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'shared' && (
            <div>
              <h2 className="text-2xl font-bold text-purple-800 mb-6">Shared Questions & Answers</h2>
              <div className="text-center py-12">
                <i className="ri-share-line text-6xl text-purple-300 mb-4"></i>
                <p className="text-purple-600 text-lg">Share questions from your main page or history to see them here!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-purple-800 mb-4">Add Friend</h3>
            <p className="text-purple-600 mb-4">Enter your friend's Gmail address to send them an invitation:</p>
            <input
              type="email"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              placeholder="friend@gmail.com"
              className="w-full p-3 border border-purple-200 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <div className="flex space-x-3">
              <button
                onClick={handleAddFriend}
                disabled={addFriendMutation.isPending}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-2 rounded-lg transition-colors"
              >
                {addFriendMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </button>
              <button
                onClick={() => setShowAddFriend(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-purple-800 mb-4">Create Study Group</h3>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full p-3 border border-purple-200 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="What will your group learn about?"
              className="w-full p-3 border border-purple-200 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex space-x-3">
              <button
                onClick={handleCreateGroup}
                disabled={createGroupMutation.isPending}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white py-2 rounded-lg transition-colors"
              >
                {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
              </button>
              <button
                onClick={() => setShowCreateGroup(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}