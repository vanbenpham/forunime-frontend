// // message.tsx
// import React, { useEffect, useState, useMemo, useCallback } from 'react';
// import {
//   Box,
//   IconButton,
//   TextField,
//   Typography,
//   Paper,
//   List,
//   ListItem,
//   ListItemText,
//   Divider,
//   ClickAwayListener,
//   Avatar,
//   ListItemAvatar,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Chip,
//   Checkbox,
// } from '@mui/material';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import SendIcon from '@mui/icons-material/Send';
// import AddIcon from '@mui/icons-material/Add';
// import LoginBar from '../../components/appbar/LoginBar';
// import { useNavigate } from 'react-router-dom';
// import { useUser } from '../../components/context/UserContext';
// import axios from 'axios';

// interface User {
//   user_id: number;
//   username: string;
//   profile_picture_url: string;
// }

// interface Group {
//   group_id: number;
//   group_name: string;
//   members: User[];
// }

// interface Message {
//   message_id: number;
//   content: string;
//   date_created: string;
//   sender: User;
//   receiver?: User;
//   group?: Group;
// }

// const MessagePage: React.FC = () => {
//   const navigate = useNavigate();
//   const { user } = useUser();

//   const [allMessages, setAllMessages] = useState<Message[]>([]);
//   const [newMessageContent, setNewMessageContent] = useState<string>('');
//   const [selectedUser, setSelectedUser] = useState<User | null>(null);
//   const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
//   const [errorMessage, setErrorMessage] = useState<string>('');
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [search, setSearch] = useState<string>('');
//   const [chattedUsers, setChattedUsers] = useState<User[]>([]);
//   const [searchedUsers, setSearchedUsers] = useState<User[]>([]);
//   const [groups, setGroups] = useState<Group[]>([]);

//   const [ws, setWs] = useState<WebSocket | null>(null);
//   const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://127.0.0.1:8000';
//   const wsUrl = apiUrl.replace(/^http/, 'ws') + `/messages/ws/messages/${user?.user_id}`;
//   const currentUserId = user?.user_id;

//   // Group creation states
//   const [isGroupDialogOpen, setIsGroupDialogOpen] = useState<boolean>(false);
//   const [groupUsersToAdd, setGroupUsersToAdd] = useState<User[]>([]);
//   const [newGroupName, setNewGroupName] = useState<string>('');
//   const [groupSearch, setGroupSearch] = useState<string>('');
//   const [groupSearchedUsers, setGroupSearchedUsers] = useState<User[]>([]);

//   // Function to fetch messages for a specific conversation
//   const fetchMessages = useCallback(
//     async (conversation: { user?: User; group?: Group }) => {
//       if (!user?.token) return;

//       try {
//         setIsLoading(true);
//         const params: any = {};

//         if (conversation.group) {
//           params.group_id = conversation.group.group_id;
//         }

//         const response = await axios.get<Message[]>(`${apiUrl}/messages/`, {
//           headers: { Authorization: `Bearer ${user.token}` },
//           params,
//         });

//         if (response?.data) {
//           const sorted = response.data.sort(
//             (a, b) => new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
//           );
//           setAllMessages(sorted);
//         } else {
//           setAllMessages([]);
//         }
//       } catch (error) {
//         console.error('Error fetching messages:', error);
//         setErrorMessage('Failed to load messages.');
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [apiUrl, user]
//   );

//   // Initialize WebSocket connection once on component mount
//   useEffect(() => {
//     if (!currentUserId) return;

//     const newWs = new WebSocket(wsUrl);

//     newWs.onopen = () => {
//       console.log('WebSocket connected');
//     };

//     newWs.onmessage = (event) => {
//       const receivedMessage: Message = JSON.parse(event.data);

//       // Determine if the message belongs to the selected conversation
//       const belongsToSelectedConversation =
//         (selectedGroup && receivedMessage.group?.group_id === selectedGroup.group_id) ||
//         (selectedUser &&
//           ((receivedMessage.receiver && receivedMessage.receiver.user_id === selectedUser.user_id) ||
//             receivedMessage.sender.user_id === selectedUser.user_id));

//       if (belongsToSelectedConversation) {
//         setAllMessages((prev) => {
//           if (prev.find((m) => m.message_id === receivedMessage.message_id)) return prev;
//           return [...prev, receivedMessage];
//         });
//       }
//     };

//     newWs.onerror = (error) => {
//       console.error('WebSocket error:', error);
//     };

//     newWs.onclose = () => {
//       console.log('WebSocket disconnected');
//     };

//     setWs(newWs);
//     return () => {
//       newWs.close();
//     };
//   }, [wsUrl, currentUserId, selectedUser, selectedGroup]);

//   // Fetch groups on component mount
//   useEffect(() => {
//     if (!user?.token) return;

//     const fetchGroups = async () => {
//       try {
//         setIsLoading(true);
//         const groupsResponse = await axios.get<Group[]>(`${apiUrl}/groups/`, {
//           headers: { Authorization: `Bearer ${user.token}` },
//         });
//         setGroups(groupsResponse.data);
//       } catch (error) {
//         console.error('Error fetching groups:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchGroups();
//   }, [apiUrl, user]);

//   // Fetch chatted users on component mount
//   useEffect(() => {
//     const fetchChattedUsers = async () => {
//       if (!user?.token) return;
//       try {
//         const response = await axios.get<User[]>(`${apiUrl}/messages/chat-list`, {
//           headers: { Authorization: `Bearer ${user.token}` },
//         });
//         setChattedUsers(response.data);
//       } catch (error) {
//         console.error('Error fetching chatted users:', error);
//       }
//     };

//     fetchChattedUsers();
//   }, [apiUrl, user]);

//   // Search functionality for main search bar
//   useEffect(() => {
//     if (!user?.token || !search.trim()) {
//       setSearchedUsers([]);
//       return;
//     }

//     const fetchFilteredUsers = async () => {
//       try {
//         setIsLoading(true);
//         const response = await axios.get<User[]>(`${apiUrl}/users/`, {
//           headers: { Authorization: `Bearer ${user.token}` },
//           params: { username: search.trim() },
//         });
//         setSearchedUsers(response.data);
//       } catch (error) {
//         console.error('Error fetching searched users:', error);
//         setSearchedUsers([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const timeoutId = setTimeout(fetchFilteredUsers, 300);
//     return () => clearTimeout(timeoutId);
//   }, [apiUrl, user, search]);

//   // Search functionality for group creation
//   useEffect(() => {
//     if (!user?.token || !groupSearch.trim()) {
//       setGroupSearchedUsers([]);
//       return;
//     }

//     const fetchGroupFilteredUsers = async () => {
//       try {
//         setIsLoading(true);
//         const response = await axios.get<User[]>(`${apiUrl}/users/`, {
//           headers: { Authorization: `Bearer ${user.token}` },
//           params: { username: groupSearch.trim() },
//         });
//         setGroupSearchedUsers(response.data);
//       } catch (error) {
//         console.error('Error fetching group searched users:', error);
//         setGroupSearchedUsers([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const timeoutId = setTimeout(fetchGroupFilteredUsers, 300);
//     return () => clearTimeout(timeoutId);
//   }, [apiUrl, user, groupSearch]);

//   // Persist selected group on component mount
//   useEffect(() => {
//     const storedGroupId = localStorage.getItem('selectedGroupId');
//     if (storedGroupId) {
//       const group = groups.find((g) => g.group_id === parseInt(storedGroupId));
//       if (group) {
//         setSelectedGroup(group);
//         setSelectedUser(null);
//         fetchMessages({ group });
//       }
//     }
//   }, [groups, fetchMessages]);

//   // Fetch messages whenever the selected conversation changes
//   useEffect(() => {
//     if (selectedGroup) {
//       // Fetch messages for the selected group
//       fetchMessages({ group: selectedGroup });
//       localStorage.setItem('selectedGroupId', selectedGroup.group_id.toString());
//     } else if (selectedUser) {
//       // Fetch messages for the selected user
//       fetchMessages({ user: selectedUser });
//       localStorage.removeItem('selectedGroupId');
//     } else {
//       // No conversation selected, clear messages
//       setAllMessages([]);
//       localStorage.removeItem('selectedGroupId');
//     }
//   }, [selectedUser, selectedGroup, fetchMessages]);

//   // Define 'messages' using useMemo
//   const messages = useMemo(() => {
//     if (!selectedUser && !selectedGroup) return [];

//     if (selectedUser && currentUserId) {
//       // One-on-one chat: show only messages involving currentUser and selectedUser
//       return allMessages.filter((m) => {
//         const senderId = m.sender.user_id;
//         const receiverId = m.receiver?.user_id;
//         return (
//           (senderId === currentUserId && receiverId === selectedUser.user_id) ||
//           (senderId === selectedUser.user_id && receiverId === currentUserId)
//         );
//       });
//     } else if (selectedGroup) {
//       // Group chat: only messages in that group
//       return allMessages.filter((m) => m.group?.group_id === selectedGroup.group_id);
//     }

//     return [];
//   }, [allMessages, selectedUser, selectedGroup, currentUserId]);

//   // Handle sending a new message
//   const handleCreateMessage = async () => {
//     if (!newMessageContent.trim()) {
//       setErrorMessage('Please enter a message.');
//       return;
//     }

//     try {
//       const newMessageData = {
//         content: newMessageContent,
//         receiver_id: selectedUser ? selectedUser.user_id : undefined,
//         group_id: selectedGroup ? selectedGroup.group_id : undefined,
//       };

//       const response = await axios.post<Message>(
//         `${apiUrl}/messages/`,
//         newMessageData,
//         {
//           headers: { Authorization: `Bearer ${user?.token}` },
//         }
//       );

//       // Add message immediately if it's a group message or involves the selected user
//       if (
//         (selectedGroup && response.data.group?.group_id === selectedGroup.group_id) ||
//         (selectedUser &&
//           (response.data.receiver?.user_id === selectedUser.user_id ||
//             response.data.sender.user_id === selectedUser.user_id))
//       ) {
//         setAllMessages((prev) => {
//           if (prev.find((m) => m.message_id === response.data.message_id)) return prev;
//           return [...prev, response.data];
//         });
//       }

//       setNewMessageContent('');
//       setErrorMessage('');

//       if (selectedUser && !chattedUsers.find((u) => u.user_id === selectedUser.user_id)) {
//         setChattedUsers((prev) => [...prev, selectedUser]);
//       }
//     } catch (error) {
//       console.error('Error creating message:', error);
//       setErrorMessage('Failed to send message. Please try again.');
//     }
//   };

//   // Handle selecting a user from the main search or list
//   const handleUserSelect = (userToChat: User) => {
//     if (!chattedUsers.find((u) => u.user_id === userToChat.user_id)) {
//       setChattedUsers((prev) => [...prev, userToChat]);
//     }

//     setSelectedUser(userToChat);
//     setSelectedGroup(null);
//     setSearch('');
//     setSearchedUsers([]);
//     setIsGroupDialogOpen(false); // Close any open group dialog
//   };

//   // Handle selecting a group from the list
//   const handleGroupSelect = (groupToChat: Group) => {
//     setSelectedGroup(groupToChat);
//     setSelectedUser(null);
//     setSearch('');
//     setSearchedUsers([]);
//     setIsGroupDialogOpen(false); // Close any open group dialog
//   };

//   // Handle ClickAway for main search
//   const handleClickAway = () => {
//     if (!search.trim()) {
//       setSearchedUsers([]);
//     }
//   };

//   // Open Group Creation Dialog
//   const openGroupDialog = () => {
//     setIsGroupDialogOpen(true);
//     setGroupUsersToAdd([]);
//     setNewGroupName('');
//     setGroupSearch('');
//     setGroupSearchedUsers([]);
//   };

//   // Close Group Creation Dialog
//   const closeGroupDialog = () => {
//     setIsGroupDialogOpen(false);
//     setGroupUsersToAdd([]);
//     setNewGroupName('');
//     setGroupSearch('');
//     setGroupSearchedUsers([]);
//   };

//   // Add user to the group creation list
//   const addUserToGroup = (u: User) => {
//     if (!groupUsersToAdd.find((user) => user.user_id === u.user_id)) {
//       setGroupUsersToAdd((prev) => [...prev, u]);
//     }
//   };

//   // Remove user from the group creation list
//   const removeUserFromGroup = (uid: number) => {
//     setGroupUsersToAdd((prev) => prev.filter((u) => u.user_id !== uid));
//   };

//   // Create a new group
//   const createGroup = async () => {
//     if (!user?.token || !newGroupName.trim() || groupUsersToAdd.length === 0) {
//       setErrorMessage('Please provide a group name and select at least one member.');
//       return;
//     }

//     try {
//       const member_ids = groupUsersToAdd.map((u) => u.user_id);
//       const data = { group_name: newGroupName, member_ids };
//       const response = await axios.post<Group>(`${apiUrl}/groups/`, data, {
//         headers: { Authorization: `Bearer ${user.token}` },
//       });

//       // After creating the group, select it as the conversation
//       if (response.data) {
//         setGroups((prev) => [...prev, response.data]);
//         setSelectedGroup(response.data);
//         setSelectedUser(null);
//       }

//       // Close group creation dialog
//       closeGroupDialog();
//     } catch (err) {
//       console.error('Error creating group:', err);
//       setErrorMessage('Failed to create group. Please try again.');
//     }
//   };

//   return (
//     <Box display="flex" flexDirection="column" height="100vh">
//       <LoginBar pageTitle="MESSAGES" />
//       <Box display="flex" alignItems="center" padding="16px">
//         <IconButton onClick={() => navigate(-1)}>
//           <ArrowBackIcon sx={{ color: 'white' }} />
//         </IconButton>
//         <ClickAwayListener onClickAway={handleClickAway}>
//           <Box sx={{ position: 'relative', width: '50%', marginLeft: 2 }}>
//             <TextField
//               label="Search Users"
//               variant="outlined"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               sx={{ backgroundColor: 'white', width: '100%' }}
//             />

//             {searchedUsers.length > 0 && search.trim() !== '' && (
//               <Paper
//                 sx={{
//                   position: 'absolute',
//                   top: '100%',
//                   width: '100%',
//                   zIndex: 10,
//                   maxHeight: 200,
//                   overflowY: 'auto',
//                 }}
//               >
//                 {searchedUsers.map((searchedUser) => (
//                   <React.Fragment key={searchedUser.user_id}>
//                     <ListItem button onClick={() => handleUserSelect(searchedUser)}>
//                       <ListItemAvatar>
//                         <Avatar src={searchedUser.profile_picture_url} />
//                       </ListItemAvatar>
//                       <ListItemText primary={searchedUser.username} />
//                     </ListItem>
//                     <Divider />
//                   </React.Fragment>
//                 ))}
//                 {searchedUsers.length === 0 && !isLoading && (
//                   <Typography variant="body1" sx={{ padding: '10px' }}>
//                     No users match your search.
//                   </Typography>
//                 )}
//               </Paper>
//             )}
//           </Box>
//         </ClickAwayListener>
//         <Button
//           onClick={openGroupDialog}
//           variant="contained"
//           sx={{ marginLeft: 2 }}
//           startIcon={<AddIcon />}
//         >
//           Create Group
//         </Button>
//       </Box>
//       <Box display="flex" flexGrow={1}>
//         <Box
//           component={Paper}
//           sx={{
//             width: '25%',
//             backgroundColor: 'white',
//             borderRight: '3px #C3C4B8 solid',
//             overflowY: 'auto',
//           }}
//         >
//           <List>
//             {chattedUsers.map((chatUser) => (
//               <React.Fragment key={chatUser.user_id}>
//                 <ListItem
//                   button
//                   selected={selectedUser?.user_id === chatUser.user_id}
//                   onClick={() => handleUserSelect(chatUser)}
//                 >
//                   <ListItemAvatar>
//                     <Avatar src={chatUser.profile_picture_url} />
//                   </ListItemAvatar>
//                   <ListItemText primary={chatUser.username} />
//                 </ListItem>
//                 <Divider />
//               </React.Fragment>
//             ))}

//             {groups.map((group) => (
//               <React.Fragment key={group.group_id}>
//                 <ListItem
//                   button
//                   selected={selectedGroup?.group_id === group.group_id}
//                   onClick={() => handleGroupSelect(group)}
//                 >
//                   <ListItemText primary={group.group_name} />
//                 </ListItem>
//                 <Divider />
//               </React.Fragment>
//             ))}
//           </List>
//         </Box>

//         <Box
//           display="flex"
//           flexDirection="column"
//           justifyContent="space-between"
//           alignItems="center"
//           component={Paper}
//           sx={{
//             width: '75%',
//             backgroundColor: 'white',
//             padding: '16px',
//           }}
//         >
//           <Box
//             display="flex"
//             flexDirection="column"
//             alignItems="flex-start"
//             sx={{
//               width: '100%',
//               height: '80%',
//               overflowY: 'auto',
//               marginBottom: '16px',
//             }}
//           >
//             {isLoading ? (
//               <Typography variant="body1" sx={{ padding: '10px' }}>
//                 Loading...
//               </Typography>
//             ) : errorMessage ? (
//               <Typography variant="body1" sx={{ padding: '10px', color: 'red' }}>
//                 {errorMessage}
//               </Typography>
//             ) : messages.length > 0 ? (
//               messages.map((message) => (
//                 <Box
//                   key={message.message_id}
//                   padding="5px"
//                   component={Paper}
//                   sx={{
//                     backgroundColor: 'white',
//                     width: '100%',
//                     margin: '5px 0',
//                     border: '1px #C3C4B8 solid',
//                   }}
//                 >
//                   <Typography variant="body1" gutterBottom>
//                     {message.sender.username}: {message.content}
//                   </Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     {new Date(message.date_created).toLocaleString()}
//                   </Typography>
//                 </Box>
//               ))
//             ) : (selectedUser || selectedGroup) ? (
//               <Typography variant="body1" sx={{ padding: '10px' }}>
//                 No messages found
//               </Typography>
//             ) : (
//               <Typography variant="body1" sx={{ padding: '10px' }}>
//                 Select a user or group to start chatting
//               </Typography>
//             )}
//           </Box>

//           <Box display="flex" width="100%">
//             <TextField
//               label="Type your message"
//               variant="outlined"
//               value={newMessageContent}
//               onChange={(e) => setNewMessageContent(e.target.value)}
//               sx={{ flexGrow: 1, backgroundColor: 'white' }}
//               disabled={!selectedUser && !selectedGroup}
//             />
//             <IconButton
//               onClick={handleCreateMessage}
//               disabled={!newMessageContent.trim() || (!selectedUser && !selectedGroup)}
//               sx={{ marginLeft: 1 }}
//             >
//               <SendIcon sx={{ color: 'primary.main' }} />
//             </IconButton>
//           </Box>
//         </Box>
//       </Box>

//       {/* Group Creation Dialog */}
//       <Dialog open={isGroupDialogOpen} onClose={closeGroupDialog} fullWidth maxWidth="sm">
//         <DialogTitle>Create New Group</DialogTitle>
//         <DialogContent>
//           <Box display="flex" flexDirection="column" gap={2}>
//             <TextField
//               label="Search Users"
//               variant="outlined"
//               value={groupSearch}
//               onChange={(e) => setGroupSearch(e.target.value)}
//               sx={{ backgroundColor: 'white', width: '100%' }}
//             />
//             {groupSearchedUsers.length > 0 && groupSearch.trim() !== '' && (
//               <Paper
//                 sx={{
//                   maxHeight: 200,
//                   overflowY: 'auto',
//                 }}
//               >
//                 <List>
//                   {groupSearchedUsers.map((searchedUser) => (
//                     <React.Fragment key={searchedUser.user_id}>
//                       <ListItem button onClick={() => addUserToGroup(searchedUser)}>
//                         <ListItemAvatar>
//                           <Avatar src={searchedUser.profile_picture_url} />
//                         </ListItemAvatar>
//                         <ListItemText primary={searchedUser.username} />
//                         <Checkbox
//                           edge="end"
//                           checked={groupUsersToAdd.some((u) => u.user_id === searchedUser.user_id)}
//                           tabIndex={-1}
//                           disableRipple
//                         />
//                       </ListItem>
//                       <Divider />
//                     </React.Fragment>
//                   ))}
//                 </List>
//               </Paper>
//             )}
//             <Box display="flex" flexWrap="wrap" gap={1}>
//               {groupUsersToAdd.map((u) => (
//                 <Chip
//                   key={u.user_id}
//                   label={u.username}
//                   onDelete={() => removeUserFromGroup(u.user_id)}
//                   color="primary"
//                 />
//               ))}
//             </Box>
//             <TextField
//               label="Group Name"
//               variant="outlined"
//               value={newGroupName}
//               onChange={(e) => setNewGroupName(e.target.value)}
//               sx={{ backgroundColor: 'white', width: '100%' }}
//             />
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={closeGroupDialog} color="secondary">
//             Cancel
//           </Button>
//           <Button
//             onClick={createGroup}
//             variant="contained"
//             disabled={!newGroupName.trim() || groupUsersToAdd.length === 0}
//           >
//             Create Group
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default MessagePage;


// import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
// import {
//   Box,
//   IconButton,
//   TextField,
//   Typography,
//   Paper,
//   List,
//   ListItem,
//   ListItemText,
//   Divider,
//   ClickAwayListener,
//   Avatar,
//   ListItemAvatar,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Chip,
//   Checkbox,
// } from '@mui/material';
// import { styled } from '@mui/material/styles';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import SendIcon from '@mui/icons-material/Send';
// import AddIcon from '@mui/icons-material/Add';
// import LoginBar from '../../components/appbar/LoginBar';
// import { useNavigate } from 'react-router-dom';
// import { useUser } from '../../components/context/UserContext';
// import axios from 'axios';

// interface User {
//   user_id: number;
//   username: string;
//   profile_picture_url: string;
// }

// interface Group {
//   group_id: number;
//   group_name: string;
//   members: User[];
// }

// interface Message {
//   message_id: number;
//   content: string;
//   date_created: string;
//   sender: User;
//   receiver?: User;
//   group?: Group;
// }

// // Styled Components
// const MessageContainer = styled(Box)(({ theme }) => ({
//   display: 'flex',
//   flexDirection: 'column',
//   overflowY: 'auto',
//   padding: theme.spacing(2),
//   flexGrow: 1,
//   width: '100%', // Ensure full width for proper alignment
// }));

// const MessageRow = styled(Box)<{ isOwner: boolean }>(({ isOwner }) => ({
//   display: 'flex',
//   justifyContent: isOwner ? 'flex-end' : 'flex-start',
//   width: '100%',
//   marginBottom: '16px', // Increased margin for better spacing
// }));

// const MessageBubble = styled(Box)<{ isOwner: boolean }>(({ theme, isOwner }) => ({
//   backgroundColor: isOwner ? theme.palette.primary.main : theme.palette.grey[300],
//   color: isOwner ? 'white' : 'black',
//   padding: theme.spacing(1, 2),
//   borderRadius: theme.spacing(2),
//   maxWidth: '70%',
//   wordBreak: 'break-word',
// }));

// const SenderName = styled(Typography)(({ theme }) => ({
//   fontWeight: 'bold',
//   marginBottom: theme.spacing(0.5),
// }));

// const MessagePage: React.FC = () => {
//   const navigate = useNavigate();
//   const { user } = useUser();

//   const [allMessages, setAllMessages] = useState<Message[]>([]);
//   const [newMessageContent, setNewMessageContent] = useState<string>('');
//   const [selectedUser, setSelectedUser] = useState<User | null>(null);
//   const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
//   const [errorMessage, setErrorMessage] = useState<string>('');
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [search, setSearch] = useState<string>('');
//   const [chattedUsers, setChattedUsers] = useState<User[]>([]);
//   const [searchedUsers, setSearchedUsers] = useState<User[]>([]);
//   const [groups, setGroups] = useState<Group[]>([]);

//   const [ws, setWs] = useState<WebSocket | null>(null);
//   const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://127.0.0.1:8000';
//   const wsUrl = apiUrl.replace(/^http/, 'ws') + `/messages/ws/messages/${user?.user_id}`;
//   const currentUserId = user?.user_id;

//   // Group creation states
//   const [isGroupDialogOpen, setIsGroupDialogOpen] = useState<boolean>(false);
//   const [groupUsersToAdd, setGroupUsersToAdd] = useState<User[]>([]);
//   const [newGroupName, setNewGroupName] = useState<string>('');
//   const [groupSearch, setGroupSearch] = useState<string>('');
//   const [groupSearchedUsers, setGroupSearchedUsers] = useState<User[]>([]);

//   // Ref for scrolling to bottom
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   // Function to fetch messages for a specific conversation
//   const fetchMessages = useCallback(
//     async (conversation: { user?: User; group?: Group }) => {
//       if (!user?.token) return;

//       try {
//         setIsLoading(true);
//         const params: any = {};

//         if (conversation.group) {
//           params.group_id = conversation.group.group_id;
//         }

//         const response = await axios.get<Message[]>(`${apiUrl}/messages/`, {
//           headers: { Authorization: `Bearer ${user.token}` },
//           params,
//         });

//         if (response?.data) {
//           const sorted = response.data.sort(
//             (a, b) => new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
//           );
//           setAllMessages(sorted);
//         } else {
//           setAllMessages([]);
//         }
//       } catch (error) {
//         console.error('Error fetching messages:', error);
//         setErrorMessage('Failed to load messages.');
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [apiUrl, user]
//   );

//   // Initialize WebSocket connection once on component mount
//   useEffect(() => {
//     if (!currentUserId) return;

//     const newWs = new WebSocket(wsUrl);

//     newWs.onopen = () => {
//       console.log('WebSocket connected');
//     };

//     newWs.onmessage = (event) => {
//       const receivedMessage: Message = JSON.parse(event.data);

//       // Determine if the message belongs to the selected conversation
//       const belongsToSelectedConversation =
//         (selectedGroup && receivedMessage.group?.group_id === selectedGroup.group_id) ||
//         (selectedUser &&
//           ((receivedMessage.receiver && receivedMessage.receiver.user_id === selectedUser.user_id) ||
//             receivedMessage.sender.user_id === selectedUser.user_id));

//       if (belongsToSelectedConversation) {
//         setAllMessages((prev) => {
//           if (prev.find((m) => m.message_id === receivedMessage.message_id)) return prev;
//           return [...prev, receivedMessage];
//         });
//       }
//     };

//     newWs.onerror = (error) => {
//       console.error('WebSocket error:', error);
//     };

//     newWs.onclose = () => {
//       console.log('WebSocket disconnected');
//     };

//     setWs(newWs);
//     return () => {
//       newWs.close();
//     };
//   }, [wsUrl, currentUserId, selectedUser, selectedGroup]);

//   // Fetch groups on component mount
//   useEffect(() => {
//     if (!user?.token) return;

//     const fetchGroups = async () => {
//       try {
//         setIsLoading(true);
//         const groupsResponse = await axios.get<Group[]>(`${apiUrl}/groups/`, {
//           headers: { Authorization: `Bearer ${user.token}` },
//         });
//         setGroups(groupsResponse.data);
//       } catch (error) {
//         console.error('Error fetching groups:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchGroups();
//   }, [apiUrl, user]);

//   // Fetch chatted users on component mount
//   useEffect(() => {
//     const fetchChattedUsers = async () => {
//       if (!user?.token) return;
//       try {
//         const response = await axios.get<User[]>(`${apiUrl}/messages/chat-list`, {
//           headers: { Authorization: `Bearer ${user.token}` },
//         });
//         setChattedUsers(response.data);
//       } catch (error) {
//         console.error('Error fetching chatted users:', error);
//       }
//     };

//     fetchChattedUsers();
//   }, [apiUrl, user]);

//   // Search functionality for main search bar
//   useEffect(() => {
//     if (!user?.token || !search.trim()) {
//       setSearchedUsers([]);
//       return;
//     }

//     const fetchFilteredUsers = async () => {
//       try {
//         setIsLoading(true);
//         const response = await axios.get<User[]>(`${apiUrl}/users/`, {
//           headers: { Authorization: `Bearer ${user.token}` },
//           params: { username: search.trim() },
//         });
//         setSearchedUsers(response.data);
//       } catch (error) {
//         console.error('Error fetching searched users:', error);
//         setSearchedUsers([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const timeoutId = setTimeout(fetchFilteredUsers, 300);
//     return () => clearTimeout(timeoutId);
//   }, [apiUrl, user, search]);

//   // Search functionality for group creation
//   useEffect(() => {
//     if (!user?.token || !groupSearch.trim()) {
//       setGroupSearchedUsers([]);
//       return;
//     }

//     const fetchGroupFilteredUsers = async () => {
//       try {
//         setIsLoading(true);
//         const response = await axios.get<User[]>(`${apiUrl}/users/`, {
//           headers: { Authorization: `Bearer ${user.token}` },
//           params: { username: groupSearch.trim() },
//         });
//         setGroupSearchedUsers(response.data);
//       } catch (error) {
//         console.error('Error fetching group searched users:', error);
//         setGroupSearchedUsers([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const timeoutId = setTimeout(fetchGroupFilteredUsers, 300);
//     return () => clearTimeout(timeoutId);
//   }, [apiUrl, user, groupSearch]);

//   // Persist selected group on component mount
//   useEffect(() => {
//     const storedGroupId = localStorage.getItem('selectedGroupId');
//     if (storedGroupId) {
//       const group = groups.find((g) => g.group_id === parseInt(storedGroupId));
//       if (group) {
//         setSelectedGroup(group);
//         setSelectedUser(null);
//         fetchMessages({ group });
//       }
//     }
//   }, [groups, fetchMessages]);

//   // Fetch messages whenever the selected conversation changes
//   useEffect(() => {
//     if (selectedGroup) {
//       // Fetch messages for the selected group
//       fetchMessages({ group: selectedGroup });
//       localStorage.setItem('selectedGroupId', selectedGroup.group_id.toString());
//     } else if (selectedUser) {
//       // Fetch messages for the selected user
//       fetchMessages({ user: selectedUser });
//       localStorage.removeItem('selectedGroupId');
//     } else {
//       // No conversation selected, clear messages
//       setAllMessages([]);
//       localStorage.removeItem('selectedGroupId');
//     }
//   }, [selectedUser, selectedGroup, fetchMessages]);

//   // Define 'messages' using useMemo
//   const messages = useMemo(() => {
//     if (!selectedUser && !selectedGroup) return [];

//     if (selectedUser && currentUserId) {
//       // One-on-one chat: show only messages involving currentUser and selectedUser
//       return allMessages.filter((m) => {
//         const senderId = m.sender.user_id;
//         const receiverId = m.receiver?.user_id;
//         return (
//           (senderId === currentUserId && receiverId === selectedUser.user_id) ||
//           (senderId === selectedUser.user_id && receiverId === currentUserId)
//         );
//       });
//     } else if (selectedGroup) {
//       // Group chat: only messages in that group
//       return allMessages.filter((m) => m.group?.group_id === selectedGroup.group_id);
//     }

//     return [];
//   }, [allMessages, selectedUser, selectedGroup, currentUserId]);

//   // Scroll to bottom whenever messages change
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Handle sending a new message
//   const handleCreateMessage = async () => {
//     if (!newMessageContent.trim()) {
//       setErrorMessage('Please enter a message.');
//       return;
//     }

//     try {
//       const newMessageData = {
//         content: newMessageContent,
//         receiver_id: selectedUser ? selectedUser.user_id : undefined,
//         group_id: selectedGroup ? selectedGroup.group_id : undefined,
//       };

//       const response = await axios.post<Message>(
//         `${apiUrl}/messages/`,
//         newMessageData,
//         {
//           headers: { Authorization: `Bearer ${user?.token}` },
//         }
//       );

//       // Add message immediately if it's a group message or involves the selected user
//       if (
//         (selectedGroup && response.data.group?.group_id === selectedGroup.group_id) ||
//         (selectedUser &&
//           (response.data.receiver?.user_id === selectedUser.user_id ||
//             response.data.sender.user_id === selectedUser.user_id))
//       ) {
//         setAllMessages((prev) => {
//           if (prev.find((m) => m.message_id === response.data.message_id)) return prev;
//           return [...prev, response.data];
//         });
//       }

//       setNewMessageContent('');
//       setErrorMessage('');

//       if (selectedUser && !chattedUsers.find((u) => u.user_id === selectedUser.user_id)) {
//         setChattedUsers((prev) => [...prev, selectedUser]);
//       }
//     } catch (error) {
//       console.error('Error creating message:', error);
//       setErrorMessage('Failed to send message. Please try again.');
//     }
//   };

//   // Handle selecting a user from the main search or list
//   const handleUserSelect = (userToChat: User) => {
//     if (!chattedUsers.find((u) => u.user_id === userToChat.user_id)) {
//       setChattedUsers((prev) => [...prev, userToChat]);
//     }

//     setSelectedUser(userToChat);
//     setSelectedGroup(null);
//     setSearch('');
//     setSearchedUsers([]);
//     setIsGroupDialogOpen(false); // Close any open group dialog
//   };

//   // Handle selecting a group from the list
//   const handleGroupSelect = (groupToChat: Group) => {
//     setSelectedGroup(groupToChat);
//     setSelectedUser(null);
//     setSearch('');
//     setSearchedUsers([]);
//     setIsGroupDialogOpen(false); // Close any open group dialog
//   };

//   // Handle ClickAway for main search
//   const handleClickAway = () => {
//     if (!search.trim()) {
//       setSearchedUsers([]);
//     }
//   };

//   // Open Group Creation Dialog
//   const openGroupDialog = () => {
//     setIsGroupDialogOpen(true);
//     setGroupUsersToAdd([]);
//     setNewGroupName('');
//     setGroupSearch('');
//     setGroupSearchedUsers([]);
//   };

//   // Close Group Creation Dialog
//   const closeGroupDialog = () => {
//     setIsGroupDialogOpen(false);
//     setGroupUsersToAdd([]);
//     setNewGroupName('');
//     setGroupSearch('');
//     setGroupSearchedUsers([]);
//   };

//   // Add user to the group creation list
//   const addUserToGroup = (u: User) => {
//     if (!groupUsersToAdd.find((user) => user.user_id === u.user_id)) {
//       setGroupUsersToAdd((prev) => [...prev, u]);
//     }
//   };

//   // Remove user from the group creation list
//   const removeUserFromGroup = (uid: number) => {
//     setGroupUsersToAdd((prev) => prev.filter((u) => u.user_id !== uid));
//   };

//   // Create a new group
//   const createGroup = async () => {
//     if (!user?.token || !newGroupName.trim() || groupUsersToAdd.length === 0) {
//       setErrorMessage('Please provide a group name and select at least one member.');
//       return;
//     }

//     try {
//       const member_ids = groupUsersToAdd.map((u) => u.user_id);
//       const data = { group_name: newGroupName, member_ids };
//       const response = await axios.post<Group>(`${apiUrl}/groups/`, data, {
//         headers: { Authorization: `Bearer ${user.token}` },
//       });

//       // After creating the group, select it as the conversation
//       if (response.data) {
//         setGroups((prev) => [...prev, response.data]);
//         setSelectedGroup(response.data);
//         setSelectedUser(null);
//       }

//       // Close group creation dialog
//       closeGroupDialog();
//     } catch (err) {
//       console.error('Error creating group:', err);
//       setErrorMessage('Failed to create group. Please try again.');
//     }
//   };

//   return (
//     <Box display="flex" flexDirection="column" height="100vh">
//       <LoginBar pageTitle="MESSAGES" />
//       <Box display="flex" alignItems="center" padding="16px">
//         <IconButton onClick={() => navigate(-1)}>
//           <ArrowBackIcon sx={{ color: 'white' }} />
//         </IconButton>
//         <ClickAwayListener onClickAway={handleClickAway}>
//           <Box sx={{ position: 'relative', width: '50%', marginLeft: 2 }}>
//             <TextField
//               label="Search Users"
//               variant="outlined"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               sx={{ backgroundColor: 'white', width: '100%' }}
//             />

//             {searchedUsers.length > 0 && search.trim() !== '' && (
//               <Paper
//                 sx={{
//                   position: 'absolute',
//                   top: '100%',
//                   width: '100%',
//                   zIndex: 10,
//                   maxHeight: 200,
//                   overflowY: 'auto',
//                 }}
//               >
//                 {searchedUsers.map((searchedUser) => (
//                   <React.Fragment key={searchedUser.user_id}>
//                     <ListItem button onClick={() => handleUserSelect(searchedUser)}>
//                       <ListItemAvatar>
//                         <Avatar src={searchedUser.profile_picture_url} />
//                       </ListItemAvatar>
//                       <ListItemText primary={searchedUser.username} />
//                     </ListItem>
//                     <Divider />
//                   </React.Fragment>
//                 ))}
//                 {searchedUsers.length === 0 && !isLoading && (
//                   <Typography variant="body1" sx={{ padding: '10px' }}>
//                     No users match your search.
//                   </Typography>
//                 )}
//               </Paper>
//             )}
//           </Box>
//         </ClickAwayListener>
//         <Button
//           onClick={openGroupDialog}
//           variant="contained"
//           sx={{ marginLeft: 2 }}
//           startIcon={<AddIcon />}
//         >
//           Create Group
//         </Button>
//       </Box>
//       <Box display="flex" flexGrow={1}>
//         <Box
//           component={Paper}
//           sx={{
//             width: '25%',
//             backgroundColor: 'white',
//             borderRight: '3px #C3C4B8 solid',
//             overflowY: 'auto',
//           }}
//         >
//           <List>
//             {chattedUsers.map((chatUser) => (
//               <React.Fragment key={chatUser.user_id}>
//                 <ListItem
//                   button
//                   selected={selectedUser?.user_id === chatUser.user_id}
//                   onClick={() => handleUserSelect(chatUser)}
//                 >
//                   <ListItemAvatar>
//                     <Avatar src={chatUser.profile_picture_url} />
//                   </ListItemAvatar>
//                   <ListItemText primary={chatUser.username} />
//                 </ListItem>
//                 <Divider />
//               </React.Fragment>
//             ))}

//             {groups.map((group) => (
//               <React.Fragment key={group.group_id}>
//                 <ListItem
//                   button
//                   selected={selectedGroup?.group_id === group.group_id}
//                   onClick={() => handleGroupSelect(group)}
//                 >
//                   <ListItemText primary={group.group_name} />
//                 </ListItem>
//                 <Divider />
//               </React.Fragment>
//             ))}
//           </List>
//         </Box>

//         <Box
//           display="flex"
//           flexDirection="column"
//           justifyContent="space-between"
//           alignItems="stretch" // Changed from 'center' to 'stretch'
//           component={Paper}
//           sx={{
//             width: '75%',
//             backgroundColor: 'white',
//             padding: '16px',
//             display: 'flex',
//             flexDirection: 'column',
//             height: '80vh', // Fixed height
//           }}
//         >
//           <MessageContainer>
//             {isLoading ? (
//               <Typography variant="body1" sx={{ padding: '10px' }}>
//                 Loading...
//               </Typography>
//             ) : errorMessage ? (
//               <Typography variant="body1" sx={{ padding: '10px', color: 'red' }}>
//                 {errorMessage}
//               </Typography>
//             ) : messages.length > 0 ? (
//               messages.map((message) => {
//                 const isOwner = message.sender.user_id === currentUserId;
//                 return (
//                   <MessageRow key={message.message_id} isOwner={isOwner}>
//                     <Box>
//                       {/* Display Sender's Name for Received Messages */}
//                       {!isOwner && (
//                         <SenderName variant="subtitle2">{message.sender.username}</SenderName>
//                       )}
//                       <MessageBubble isOwner={isOwner}>
//                         <Typography variant="body1">{message.content}</Typography>
//                         <Typography
//                           variant="caption"
//                           sx={{ textAlign: isOwner ? 'right' : 'left', display: 'block' }}
//                         >
//                           {new Date(message.date_created).toLocaleString()}
//                         </Typography>
//                       </MessageBubble>
//                     </Box>
//                   </MessageRow>
//                 );
//               })
//             ) : selectedUser || selectedGroup ? (
//               <Typography variant="body1" sx={{ padding: '10px' }}>
//                 No messages found
//               </Typography>
//             ) : (
//               <Typography variant="body1" sx={{ padding: '10px' }}>
//                 Select a user or group to start chatting
//               </Typography>
//             )}
//             <div ref={messagesEndRef} />
//           </MessageContainer>

//           {/* Message Input Section */}
//           <Box display="flex" width="100%" marginTop="auto">
//             <TextField
//               label="Type your message"
//               variant="outlined"
//               value={newMessageContent}
//               onChange={(e) => setNewMessageContent(e.target.value)}
//               sx={{ flexGrow: 1, backgroundColor: 'white' }}
//               disabled={!selectedUser && !selectedGroup}
//               onKeyPress={(e) => {
//                 if (e.key === 'Enter') {
//                   e.preventDefault();
//                   handleCreateMessage();
//                 }
//               }}
//             />
//             <IconButton
//               onClick={handleCreateMessage}
//               disabled={!newMessageContent.trim() || (!selectedUser && !selectedGroup)}
//               sx={{ marginLeft: 1 }}
//             >
//               <SendIcon sx={{ color: 'primary.main' }} />
//             </IconButton>
//           </Box>
//         </Box>
//       </Box>

//       {/* Group Creation Dialog */}
//       <Dialog open={isGroupDialogOpen} onClose={closeGroupDialog} fullWidth maxWidth="sm">
//         <DialogTitle>Create New Group</DialogTitle>
//         <DialogContent>
//           <Box display="flex" flexDirection="column" gap={2}>
//             <TextField
//               label="Search Users"
//               variant="outlined"
//               value={groupSearch}
//               onChange={(e) => setGroupSearch(e.target.value)}
//               sx={{ backgroundColor: 'white', width: '100%' }}
//             />
//             {groupSearchedUsers.length > 0 && groupSearch.trim() !== '' && (
//               <Paper
//                 sx={{
//                   maxHeight: 200,
//                   overflowY: 'auto',
//                 }}
//               >
//                 <List>
//                   {groupSearchedUsers.map((searchedUser) => (
//                     <React.Fragment key={searchedUser.user_id}>
//                       <ListItem button onClick={() => addUserToGroup(searchedUser)}>
//                         <ListItemAvatar>
//                           <Avatar src={searchedUser.profile_picture_url} />
//                         </ListItemAvatar>
//                         <ListItemText primary={searchedUser.username} />
//                         <Checkbox
//                           edge="end"
//                           checked={groupUsersToAdd.some((u) => u.user_id === searchedUser.user_id)}
//                           tabIndex={-1}
//                           disableRipple
//                         />
//                       </ListItem>
//                       <Divider />
//                     </React.Fragment>
//                   ))}
//                 </List>
//               </Paper>
//             )}
//             <Box display="flex" flexWrap="wrap" gap={1}>
//               {groupUsersToAdd.map((u) => (
//                 <Chip
//                   key={u.user_id}
//                   label={u.username}
//                   onDelete={() => removeUserFromGroup(u.user_id)}
//                   color="primary"
//                 />
//               ))}
//             </Box>
//             <TextField
//               label="Group Name"
//               variant="outlined"
//               value={newGroupName}
//               onChange={(e) => setNewGroupName(e.target.value)}
//               sx={{ backgroundColor: 'white', width: '100%' }}
//             />
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={closeGroupDialog} color="secondary">
//             Cancel
//           </Button>
//           <Button
//             onClick={createGroup}
//             variant="contained"
//             disabled={!newGroupName.trim() || groupUsersToAdd.length === 0}
//           >
//             Create Group
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default MessagePage;


import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  ClickAwayListener,
  Avatar,
  ListItemAvatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Checkbox,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import LoginBar from '../../components/appbar/LoginBar';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../components/context/UserContext';
import axios from 'axios';

interface User {
  user_id: number;
  username: string;
  profile_picture_url: string;
}

interface Group {
  group_id: number;
  group_name: string;
  members: User[];
}

interface Message {
  message_id: number;
  content: string;
  date_created: string;
  sender: User;
  receiver?: User;
  group?: Group;
  deleted_for_receiver?: boolean;
}

// Styled Components
const MessageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  padding: theme.spacing(2),
  flexGrow: 1,
  width: '100%', // Ensure full width for proper alignment
}));

const MessageRow = styled(Box)<{ isOwner: boolean }>(({ isOwner }) => ({
  display: 'flex',
  justifyContent: isOwner ? 'flex-end' : 'flex-start',
  width: '100%',
  marginBottom: '16px', // Increased margin for better spacing
}));

const MessageBubble = styled(Box)<{ isOwner: boolean }>(({ theme, isOwner }) => ({
  position: 'relative', // To position icons absolutely within the bubble
  backgroundColor: isOwner ? theme.palette.primary.main : theme.palette.grey[300],
  color: isOwner ? 'white' : 'black',
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(2),
  maxWidth: '70%',
  wordBreak: 'break-word',
  '&:hover .action-icons': {
    visibility: 'visible',
  },
}));

const ActionIcons = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '5px',
  right: '5px',
  display: 'flex',
  gap: '5px',
  visibility: 'hidden', // Hidden by default, visible on hover
}));

const SenderName = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(0.5),
}));

const MessagePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [newMessageContent, setNewMessageContent] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [chattedUsers, setChattedUsers] = useState<User[]>([]);
  const [searchedUsers, setSearchedUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [ws, setWs] = useState<WebSocket | null>(null);
  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://127.0.0.1:8000';
  const wsUrl = apiUrl.replace(/^http/, 'ws') + `/messages/ws/messages/${user?.user_id}`;
  const currentUserId = user?.user_id;

  // Group creation states
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState<boolean>(false);
  const [groupUsersToAdd, setGroupUsersToAdd] = useState<User[]>([]);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [groupSearch, setGroupSearch] = useState<string>('');
  const [groupSearchedUsers, setGroupSearchedUsers] = useState<User[]>([]);

  // Edit Message states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [messageToEdit, setMessageToEdit] = useState<Message | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');

  // Delete Message states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);

  // Ref for scrolling to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to fetch messages for a specific conversation
  const fetchMessages = useCallback(
    async (conversation: { user?: User; group?: Group }) => {
      if (!user?.token) return;

      try {
        setIsLoading(true);
        const params: any = {};

        if (conversation.group) {
          params.group_id = conversation.group.group_id;
        }

        const response = await axios.get<Message[]>(`${apiUrl}/messages/`, {
          headers: { Authorization: `Bearer ${user.token}` },
          params,
        });

        if (response?.data) {
          const sorted = response.data.sort(
            (a, b) => new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
          );
          setAllMessages(sorted);
        } else {
          setAllMessages([]);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setErrorMessage('Failed to load messages.');
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl, user]
  );

  // Initialize WebSocket connection once on component mount
  useEffect(() => {
    if (!currentUserId) return;

    const newWs = new WebSocket(wsUrl);

    newWs.onopen = () => {
      console.log('WebSocket connected');
    };

    newWs.onmessage = (event) => {
      const receivedMessage: Message = JSON.parse(event.data);

      // Determine if the message belongs to the selected conversation
      const belongsToSelectedConversation =
        (selectedGroup && receivedMessage.group?.group_id === selectedGroup.group_id) ||
        (selectedUser &&
          ((receivedMessage.receiver && receivedMessage.receiver.user_id === selectedUser.user_id) ||
            receivedMessage.sender.user_id === selectedUser.user_id));

      if (belongsToSelectedConversation) {
        setAllMessages((prev) => {
          if (prev.find((m) => m.message_id === receivedMessage.message_id)) return prev;
          return [...prev, receivedMessage];
        });
      }
    };

    newWs.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    newWs.onclose = () => {
      console.log('WebSocket disconnected');
    };

    setWs(newWs);
    return () => {
      newWs.close();
    };
  }, [wsUrl, currentUserId, selectedUser, selectedGroup]);

  // Fetch groups on component mount
  useEffect(() => {
    if (!user?.token) return;

    const fetchGroups = async () => {
      try {
        setIsLoading(true);
        const groupsResponse = await axios.get<Group[]>(`${apiUrl}/groups/`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setGroups(groupsResponse.data);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, [apiUrl, user]);

  // Fetch chatted users on component mount
  useEffect(() => {
    const fetchChattedUsers = async () => {
      if (!user?.token) return;
      try {
        const response = await axios.get<User[]>(`${apiUrl}/messages/chat-list`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setChattedUsers(response.data);
      } catch (error) {
        console.error('Error fetching chatted users:', error);
      }
    };

    fetchChattedUsers();
  }, [apiUrl, user]);

  // Search functionality for main search bar
  useEffect(() => {
    if (!user?.token || !search.trim()) {
      setSearchedUsers([]);
      return;
    }

    const fetchFilteredUsers = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<User[]>(`${apiUrl}/users/`, {
          headers: { Authorization: `Bearer ${user.token}` },
          params: { username: search.trim() },
        });
        setSearchedUsers(response.data);
      } catch (error) {
        console.error('Error fetching searched users:', error);
        setSearchedUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchFilteredUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [apiUrl, user, search]);

  // Search functionality for group creation
  useEffect(() => {
    if (!user?.token || !groupSearch.trim()) {
      setGroupSearchedUsers([]);
      return;
    }

    const fetchGroupFilteredUsers = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<User[]>(`${apiUrl}/users/`, {
          headers: { Authorization: `Bearer ${user.token}` },
          params: { username: groupSearch.trim() },
        });
        setGroupSearchedUsers(response.data);
      } catch (error) {
        console.error('Error fetching group searched users:', error);
        setGroupSearchedUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchGroupFilteredUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [apiUrl, user, groupSearch]);

  // Persist selected group on component mount
  useEffect(() => {
    const storedGroupId = localStorage.getItem('selectedGroupId');
    if (storedGroupId) {
      const group = groups.find((g) => g.group_id === parseInt(storedGroupId));
      if (group) {
        setSelectedGroup(group);
        setSelectedUser(null);
        fetchMessages({ group });
      }
    }
  }, [groups, fetchMessages]);

  // Fetch messages whenever the selected conversation changes
  useEffect(() => {
    if (selectedGroup) {
      // Fetch messages for the selected group
      fetchMessages({ group: selectedGroup });
      localStorage.setItem('selectedGroupId', selectedGroup.group_id.toString());
    } else if (selectedUser) {
      // Fetch messages for the selected user
      fetchMessages({ user: selectedUser });
      localStorage.removeItem('selectedGroupId');
    } else {
      // No conversation selected, clear messages
      setAllMessages([]);
      localStorage.removeItem('selectedGroupId');
    }
  }, [selectedUser, selectedGroup, fetchMessages]);

  // Define 'messages' using useMemo
  const messages = useMemo(() => {
    if (!selectedUser && !selectedGroup) return [];

    if (selectedUser && currentUserId) {
      // One-on-one chat: show only messages involving currentUser and selectedUser
      return allMessages.filter((m) => {
        const senderId = m.sender.user_id;
        const receiverId = m.receiver?.user_id;
        return (
          (senderId === currentUserId && receiverId === selectedUser.user_id) ||
          (senderId === selectedUser.user_id && receiverId === currentUserId)
        );
      });
    } else if (selectedGroup) {
      // Group chat: only messages in that group
      return allMessages.filter((m) => m.group?.group_id === selectedGroup.group_id);
    }

    return [];
  }, [allMessages, selectedUser, selectedGroup, currentUserId]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a new message
  const handleCreateMessage = async () => {
    if (!newMessageContent.trim()) {
      setErrorMessage('Please enter a message.');
      return;
    }

    try {
      const newMessageData = {
        content: newMessageContent,
        receiver_id: selectedUser ? selectedUser.user_id : undefined,
        group_id: selectedGroup ? selectedGroup.group_id : undefined,
      };

      const response = await axios.post<Message>(
        `${apiUrl}/messages/`,
        newMessageData,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      // Add message immediately if it's a group message or involves the selected user
      if (
        (selectedGroup && response.data.group?.group_id === selectedGroup.group_id) ||
        (selectedUser &&
          (response.data.receiver?.user_id === selectedUser.user_id ||
            response.data.sender.user_id === selectedUser.user_id))
      ) {
        setAllMessages((prev) => {
          if (prev.find((m) => m.message_id === response.data.message_id)) return prev;
          return [...prev, response.data];
        });
      }

      setNewMessageContent('');
      setErrorMessage('');

      if (selectedUser && !chattedUsers.find((u) => u.user_id === selectedUser.user_id)) {
        setChattedUsers((prev) => [...prev, selectedUser]);
      }
    } catch (error) {
      console.error('Error creating message:', error);
      setErrorMessage('Failed to send message. Please try again.');
    }
  };

  // Handle selecting a user from the main search or list
  const handleUserSelect = (userToChat: User) => {
    if (!chattedUsers.find((u) => u.user_id === userToChat.user_id)) {
      setChattedUsers((prev) => [...prev, userToChat]);
    }

    setSelectedUser(userToChat);
    setSelectedGroup(null);
    setSearch('');
    setSearchedUsers([]);
    setIsGroupDialogOpen(false); // Close any open group dialog
  };

  // Handle selecting a group from the list
  const handleGroupSelect = (groupToChat: Group) => {
    setSelectedGroup(groupToChat);
    setSelectedUser(null);
    setSearch('');
    setSearchedUsers([]);
    setIsGroupDialogOpen(false); // Close any open group dialog
  };

  // Handle ClickAway for main search
  const handleClickAway = () => {
    if (!search.trim()) {
      setSearchedUsers([]);
    }
  };

  // Open Group Creation Dialog
  const openGroupDialog = () => {
    setIsGroupDialogOpen(true);
    setGroupUsersToAdd([]);
    setNewGroupName('');
    setGroupSearch('');
    setGroupSearchedUsers([]);
  };

  // Close Group Creation Dialog
  const closeGroupDialog = () => {
    setIsGroupDialogOpen(false);
    setGroupUsersToAdd([]);
    setNewGroupName('');
    setGroupSearch('');
    setGroupSearchedUsers([]);
  };

  // Add user to the group creation list
  const addUserToGroup = (u: User) => {
    if (!groupUsersToAdd.find((user) => user.user_id === u.user_id)) {
      setGroupUsersToAdd((prev) => [...prev, u]);
    }
  };

  // Remove user from the group creation list
  const removeUserFromGroup = (uid: number) => {
    setGroupUsersToAdd((prev) => prev.filter((u) => u.user_id !== uid));
  };

  // Create a new group
  const createGroup = async () => {
    if (!user?.token || !newGroupName.trim() || groupUsersToAdd.length === 0) {
      setErrorMessage('Please provide a group name and select at least one member.');
      return;
    }

    try {
      const member_ids = groupUsersToAdd.map((u) => u.user_id);
      const data = { group_name: newGroupName, member_ids };
      const response = await axios.post<Group>(`${apiUrl}/groups/`, data, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // After creating the group, select it as the conversation
      if (response.data) {
        setGroups((prev) => [...prev, response.data]);
        setSelectedGroup(response.data);
        setSelectedUser(null);
      }

      // Close group creation dialog
      closeGroupDialog();
    } catch (err) {
      console.error('Error creating group:', err);
      setErrorMessage('Failed to create group. Please try again.');
    }
  };

  // Handle editing a message
  const handleEditMessage = (message: Message) => {
    setMessageToEdit(message);
    setEditedContent(message.content);
    setIsEditDialogOpen(true);
  };

  // Handle submitting the edited message
  const handleSubmitEdit = async () => {
    if (!messageToEdit) return;

    try {
      const response = await axios.put<Message>(
        `${apiUrl}/messages/${messageToEdit.message_id}`,
        { content: editedContent },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      // Update the message in the state
      setAllMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.message_id === response.data.message_id ? response.data : msg
        )
      );

      setIsEditDialogOpen(false);
      setMessageToEdit(null);
      setEditedContent('');
    } catch (error) {
      console.error('Error editing message:', error);
      setErrorMessage('Failed to edit message. Please try again.');
    }
  };

  // Handle closing the edit dialog
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setMessageToEdit(null);
    setEditedContent('');
  };

  // Handle deleting a message
  const handleDeleteMessage = (message: Message) => {
    setMessageToDelete(message);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirming the deletion
  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;

    try {
      await axios.delete(`${apiUrl}/messages/${messageToDelete.message_id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      // Remove the message from the state
      setAllMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.message_id !== messageToDelete.message_id)
      );

      setIsDeleteDialogOpen(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error('Error deleting message:', error);
      setErrorMessage('Failed to delete message. Please try again.');
    }
  };

  // Handle closing the delete dialog
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setMessageToDelete(null);
  };

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      <LoginBar pageTitle="MESSAGES" />
      <Box display="flex" justifyItems="center" alignItems="center" padding="16px">
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon sx={{ color: 'white' }} />
        </IconButton>
        <ClickAwayListener onClickAway={handleClickAway}>
          <Box sx={{ position: 'relative', width: '50%', marginLeft: 2 }}>
            <TextField
              label="Search Users"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ backgroundColor: 'white', width: '100%' }}
            />

            {searchedUsers.length > 0 && search.trim() !== '' && (
              <Paper
                sx={{
                  position: 'absolute',
                  top: '100%',
                  width: '100%',
                  zIndex: 10,
                  maxHeight: 200,
                  overflowY: 'auto',
                }}
              >
                {searchedUsers.map((searchedUser) => (
                  <React.Fragment key={searchedUser.user_id}>
                    <ListItem button onClick={() => handleUserSelect(searchedUser)}>
                      <ListItemAvatar>
                        <Avatar src={searchedUser.profile_picture_url} />
                      </ListItemAvatar>
                      <ListItemText primary={searchedUser.username} />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
                {searchedUsers.length === 0 && !isLoading && (
                  <Typography variant="body1" sx={{ padding: '10px' }}>
                    No users match your search.
                  </Typography>
                )}
              </Paper>
            )}
          </Box>
        </ClickAwayListener>
        <Button
          onClick={openGroupDialog}
          variant="contained"
          sx={{ marginLeft: 2 }}
          startIcon={<AddIcon />}
        >
          Create Group
        </Button>
      </Box>
      <Box display="flex" flexGrow={1}>
        <Box
          component={Paper}
          sx={{
            width: '25%',
            backgroundColor: 'white',
            borderRight: '3px #C3C4B8 solid',
            overflowY: 'auto',
          }}
        >
          <List>
            {chattedUsers.map((chatUser) => (
              <React.Fragment key={chatUser.user_id}>
                <ListItem
                  button
                  selected={selectedUser?.user_id === chatUser.user_id}
                  onClick={() => handleUserSelect(chatUser)}
                >
                  <ListItemAvatar>
                    <Avatar src={chatUser.profile_picture_url} />
                  </ListItemAvatar>
                  <ListItemText primary={chatUser.username} />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}

            {groups.map((group) => (
              <React.Fragment key={group.group_id}>
                <ListItem
                  button
                  selected={selectedGroup?.group_id === group.group_id}
                  onClick={() => handleGroupSelect(group)}
                >
                  <ListItemText primary={group.group_name} />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Box>

        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          alignItems="stretch" // Changed from 'center' to 'stretch'
          component={Paper}
          sx={{
            width: '75%',
            backgroundColor: 'white',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            height: '80vh', // Fixed height
          }}
        >
          <MessageContainer>
            {isLoading ? (
              <Typography variant="body1" sx={{ padding: '10px' }}>
                Loading...
              </Typography>
            ) : errorMessage ? (
              <Typography variant="body1" sx={{ padding: '10px', color: 'red' }}>
                {errorMessage}
              </Typography>
            ) : messages.length > 0 ? (
              messages.map((message) => {
                const isOwner = message.sender.user_id === currentUserId;
                return (
                  <MessageRow key={message.message_id} isOwner={isOwner}>
                    <Box>
                      {/* Display Sender's Name for Received Messages */}
                      {!isOwner && (
                        <SenderName variant="subtitle2">{message.sender.username}</SenderName>
                      )}
                      <MessageBubble isOwner={isOwner}>
                        {/* Action Icons for Owner Messages */}
                        {isOwner && (
                          <ActionIcons className="action-icons">
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEditMessage(message)}
                                sx={{ color: 'inherit' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteMessage(message)}
                                sx={{ color: 'inherit' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </ActionIcons>
                        )}
                        <Typography variant="body1">{message.content}</Typography>
                        <Typography
                          variant="caption"
                          sx={{ textAlign: isOwner ? 'right' : 'left', display: 'block' }}
                        >
                          {new Date(message.date_created).toLocaleString()}
                        </Typography>
                      </MessageBubble>
                    </Box>
                  </MessageRow>
                );
              })
            ) : selectedUser || selectedGroup ? (
              <Typography variant="body1" sx={{ padding: '10px' }}>
                No messages found
              </Typography>
            ) : (
              <Typography variant="body1" sx={{ padding: '10px' }}>
                Select a user or group to start chatting
              </Typography>
            )}
            <div ref={messagesEndRef} />
          </MessageContainer>

          {/* Message Input Section */}
          <Box display="flex" width="100%" marginTop="auto">
            <TextField
              label="Type your message"
              variant="outlined"
              value={newMessageContent}
              onChange={(e) => setNewMessageContent(e.target.value)}
              sx={{ flexGrow: 1, backgroundColor: 'white' }}
              disabled={!selectedUser && !selectedGroup}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateMessage();
                }
              }}
            />
            <IconButton
              onClick={handleCreateMessage}
              disabled={!newMessageContent.trim() || (!selectedUser && !selectedGroup)}
              sx={{ marginLeft: 1 }}
            >
              <SendIcon sx={{ color: 'primary.main' }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Edit Message Dialog */}
      <Dialog open={isEditDialogOpen} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit Message</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Message Content"
            type="text"
            fullWidth
            variant="outlined"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmitEdit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Message</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this message? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Group Creation Dialog */}
      <Dialog open={isGroupDialogOpen} onClose={closeGroupDialog} fullWidth maxWidth="sm">
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Search Users"
              variant="outlined"
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              sx={{ backgroundColor: 'white', width: '100%' }}
            />
            {groupSearchedUsers.length > 0 && groupSearch.trim() !== '' && (
              <Paper
                sx={{
                  maxHeight: 200,
                  overflowY: 'auto',
                }}
              >
                <List>
                  {groupSearchedUsers.map((searchedUser) => (
                    <React.Fragment key={searchedUser.user_id}>
                      <ListItem button onClick={() => addUserToGroup(searchedUser)}>
                        <ListItemAvatar>
                          <Avatar src={searchedUser.profile_picture_url} />
                        </ListItemAvatar>
                        <ListItemText primary={searchedUser.username} />
                        <Checkbox
                          edge="end"
                          checked={groupUsersToAdd.some((u) => u.user_id === searchedUser.user_id)}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            )}
            <Box display="flex" flexWrap="wrap" gap={1}>
              {groupUsersToAdd.map((u) => (
                <Chip
                  key={u.user_id}
                  label={u.username}
                  onDelete={() => removeUserFromGroup(u.user_id)}
                  color="primary"
                />
              ))}
            </Box>
            <TextField
              label="Group Name"
              variant="outlined"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              sx={{ backgroundColor: 'white', width: '100%' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeGroupDialog} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={createGroup}
            variant="contained"
            disabled={!newGroupName.trim() || groupUsersToAdd.length === 0}
          >
            Create Group
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MessagePage;
