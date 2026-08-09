//Friends.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { colors, fonts } from '../styles/theme';

function Friends() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [message, setMessage] = useState('');

    const fetchFriendsAndPending = async () => {
        try {
            const friendsRes = await api.get('/friends/list');
            setFriendsList(friendsRes.data);

            const pendingRes = await api.get('/friends/pending');
            setPendingRequests(pendingRes.data);
        } catch (err) {
            console.error('Error fetching friends data', err);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchFriendsAndPending();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        try {
            const res = await api.get(`/friends/search?query=${searchQuery}`);
            setSearchResults(res.data);
        } catch (err) {
            console.error('Search failed', err);
        }
    };

    const sendFriendRequest = async (targetUsername) => {
        try {
            await api.post('/friends/request', { targetUsername });
            setMessage(`Friend request sent to ${targetUsername}`);
            setSearchResults(searchResults.filter(u => u.username !== targetUsername));
        } catch (err) {
            setMessage(err.response?.data || 'Failed to send request');
        }
    };

    const acceptFriendRequest = async (targetUsername) => {
        try {
            await api.post('/friends/accept', { targetUsername });
            setMessage(`You are now friends with ${targetUsername}`);
            fetchFriendsAndPending();
        } catch (err) {
            setMessage(err.response?.data || 'Failed to accept request');
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.background, fontFamily: fonts.family, padding: '30px 20px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ color: colors.text, margin: 0 }}>Friends</h2>
                    <Link to="/chat" style={{ color: colors.primary, fontSize: '14px', textDecoration: 'none' }}>← Back to Chat</Link>
                </div>

                {message && (
                    <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                        {message}
                    </div>
                )}

                <div style={{ backgroundColor: colors.surface, borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ marginTop: 0, color: colors.text, fontSize: '15px' }}>Search Users</h3>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Search by username"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '14px' }}
                        />
                        <button type="submit" style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', backgroundColor: colors.primary, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                            Search
                        </button>
                    </form>

                    {searchResults.length > 0 && (
                        <div style={{ marginTop: '14px' }}>
                            {searchResults.map((user) => (
                                <div key={user.id} style={rowStyle}>
                                    <span style={{ color: colors.text }}>{user.username}</span>
                                    <button onClick={() => sendFriendRequest(user.username)} style={smallButtonStyle}>
                                        Add Friend
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ backgroundColor: colors.surface, borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ marginTop: 0, color: colors.text, fontSize: '15px' }}>Pending Requests</h3>
                    {pendingRequests.length === 0 ? (
                        <p style={{ color: colors.textMuted, fontSize: '14px' }}>No pending requests</p>
                    ) : (
                        pendingRequests.map((user) => (
                            <div key={user.id} style={rowStyle}>
                                <span style={{ color: colors.text }}>{user.username}</span>
                                <button onClick={() => acceptFriendRequest(user.username)} style={smallButtonStyle}>
                                    Accept
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div style={{ backgroundColor: colors.surface, borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ marginTop: 0, color: colors.text, fontSize: '15px' }}>My Friends</h3>
                    {friendsList.length === 0 ? (
                        <p style={{ color: colors.textMuted, fontSize: '14px' }}>No friends yet</p>
                    ) : (
                        friendsList.map((user) => (
                            <div key={user.id} style={{ padding: '10px 0', borderBottom: `1px solid ${colors.border}`, color: colors.text }}>
                                {user.username}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: `1px solid ${colors.border}`,
};

const smallButtonStyle = {
    padding: '6px 14px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: colors.primary,
    color: '#fff',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
};

export default Friends;