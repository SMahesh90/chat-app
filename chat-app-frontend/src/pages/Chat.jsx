import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createStompClient, sendMessage, sendTypingStatus } from '../api/socket';
import api from '../api/axiosConfig';
import { colors, fonts } from '../styles/theme';

function Chat() {
    const username = localStorage.getItem('username');
    const [messages, setMessages] = useState([]);
    const [receiverUsername, setReceiverUsername] = useState('seconduser');
    const [content, setContent] = useState('');
    const [isReceiverOnline, setIsReceiverOnline] = useState(false);
    const [isReceiverTyping, setIsReceiverTyping] = useState(false);
    const [isConnected, setIsConnected] = useState(true);

    const clientRef = useRef(null);
    const chatBoxRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const receiverUsernameRef = useRef(receiverUsername);

    useEffect(() => {
        receiverUsernameRef.current = receiverUsername;
    }, [receiverUsername]);

    useEffect(() => {
        clientRef.current = createStompClient(
            (newMessage) => {
                setMessages((prev) => {
                    const isRelevant =
                        (newMessage.senderUsername === receiverUsernameRef.current) ||
                        (newMessage.receiverUsername === receiverUsernameRef.current);
                    if (!isRelevant) return prev;
                    const alreadyExists = prev.some((m) => m.id === newMessage.id);
                    if (alreadyExists) return prev;
                    return [...prev, newMessage];
                });
            },
            (statusUpdate) => {
                setIsReceiverOnline((prevOnline) => {
                    return statusUpdate.username === receiverUsernameRef.current ? statusUpdate.online : prevOnline;
                });
            },
            (typingEvent) => {
                if (typingEvent.username === receiverUsernameRef.current) {
                    setIsReceiverTyping(typingEvent.typing);
                }
            },
            (connected) => setIsConnected(connected)
        );

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get(`/messages/history/${receiverUsername}?page=0&size=50`);
                const sorted = [...res.data].reverse();
                setMessages(sorted);
                await api.post('/messages/mark-read', { otherUsername: receiverUsername });
            } catch (err) {
                console.error('Failed to load chat history', err);
            }
        };

        const fetchStatus = async () => {
            try {
                const res = await api.get(`/status/${receiverUsername}`);
                setIsReceiverOnline(res.data.online);
            } catch (err) {
                console.error('Failed to load status', err);
                setIsReceiverOnline(false);
            }
        };

        if (receiverUsername.trim()) {
            fetchHistory();
            fetchStatus();
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsReceiverTyping(false);
        }
    }, [receiverUsername]);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        sendMessage(clientRef.current, receiverUsername, content);
        setContent('');
        sendTypingStatus(clientRef.current, receiverUsername, false);
    };

    const handleContentChange = (e) => {
        setContent(e.target.value);
        sendTypingStatus(clientRef.current, receiverUsername, true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            sendTypingStatus(clientRef.current, receiverUsername, false);
        }, 1500);
    };

    const handleLogout = () => {
        if (clientRef.current) {
            clientRef.current.deactivate();
        }
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = '/login';
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.background, fontFamily: fonts.family, padding: '30px 20px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ color: colors.text, margin: 0 }}>Welcome, {username}!</h2>
                    <Link to="/friends" style={{ color: colors.primary, fontSize: '14px', textDecoration: 'none' }}>Manage Friends</Link>
                </div>

                {!isConnected && (
                    <div style={{ backgroundColor: colors.dangerBg, color: colors.danger, padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', textAlign: 'center' }}>
                        Reconnecting to server...
                    </div>
                )}

                <div style={{
                    backgroundColor: colors.surface,
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '14px 18px',
                        borderBottom: `1px solid ${colors.border}`,
                    }}>
                        <label style={{ color: colors.textMuted, fontSize: '13px' }}>Chatting with:</label>
                        <input
                            value={receiverUsername}
                            onChange={(e) => setReceiverUsername(e.target.value)}
                            style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: `1px solid ${colors.border}`,
                                fontSize: '14px',
                                flex: 1,
                            }}
                        />
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: colors.textMuted, whiteSpace: 'nowrap' }}>
                            <span style={{
                                width: '9px',
                                height: '9px',
                                borderRadius: '50%',
                                backgroundColor: isReceiverOnline ? colors.online : colors.offline,
                                display: 'inline-block',
                            }}></span>
                            {isReceiverOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>

                    <div
                        ref={chatBoxRef}
                        style={{
                            height: '420px',
                            overflowY: 'auto',
                            padding: '18px',
                            backgroundColor: '#fafafa',
                        }}
                    >
                        {messages.length === 0 && (
                            <p style={{ textAlign: 'center', color: colors.textMuted, marginTop: '40px' }}>No messages yet. Say hi!</p>
                        )}
                        {messages.map((msg, idx) => {
                            const isOwnMessage = msg.senderUsername === username;
                            return (
                                <div
                                    key={msg.id || idx}
                                    style={{
                                        display: 'flex',
                                        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                                        marginBottom: '10px',
                                    }}
                                >
                                    <div
                                        style={{
                                            maxWidth: '70%',
                                            padding: '9px 14px',
                                            borderRadius: '16px',
                                            backgroundColor: isOwnMessage ? colors.primary : '#e5e5ea',
                                            color: isOwnMessage ? '#fff' : colors.text,
                                        }}
                                    >
                                        <div style={{ fontSize: '14px', lineHeight: 1.4 }}>{msg.content}</div>
                                        <div style={{
                                            fontSize: '10px',
                                            marginTop: '4px',
                                            opacity: 0.75,
                                            textAlign: 'right',
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            gap: '4px',
                                        }}>
                                            {formatTime(msg.timestamp)}
                                            {isOwnMessage && (
                                                <span>{msg.status === 'READ' ? '✓✓' : '✓'}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {isReceiverTyping && (
                            <div style={{ fontStyle: 'italic', color: colors.textMuted, fontSize: '13px', marginTop: '6px' }}>
                                {receiverUsername} is typing...
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', padding: '14px 18px', borderTop: `1px solid ${colors.border}` }}>
                        <input
                            value={content}
                            onChange={handleContentChange}
                            placeholder="Type a message..."
                            style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '14px' }}
                        />
                        <button type="submit" style={{
                            padding: '10px 20px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: colors.primary,
                            color: '#fff',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}>
                            Send
                        </button>
                    </form>
                </div>

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <button onClick={handleLogout} style={{
                        padding: '8px 18px',
                        borderRadius: '8px',
                        border: `1px solid ${colors.border}`,
                        backgroundColor: colors.surface,
                        color: colors.textMuted,
                        cursor: 'pointer',
                        fontSize: '13px',
                    }}>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chat;