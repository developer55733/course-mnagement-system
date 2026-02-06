// Live Streaming and Meeting JavaScript

let currentStream = null;
let currentMeeting = null;
let streams = [];
let meetings = [];

// Initialize livestream functionality
document.addEventListener('DOMContentLoaded', function() {
    loadStreams();
    loadMeetings();
    
    // Setup form submissions
    document.getElementById('create-stream-form').addEventListener('submit', createStream);
    document.getElementById('create-meeting-form').addEventListener('submit', createMeeting);
});

// Tab switching
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav tabs
    document.querySelectorAll('.nav-tab').forEach(navTab => {
        navTab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked nav tab
    event.target.closest('.nav-tab').classList.add('active');
    
    // Load data based on tab
    if (tabName === 'livestream') {
        loadStreams();
    } else if (tabName === 'meetings') {
        loadMeetings();
    } else if (tabName === 'notes') {
        loadUserNotes();
    }
}

// Load streams
async function loadStreams() {
    try {
        const response = await apiCall('/livestream/streams');
        if (response.success) {
            streams = response.data;
            renderStreams();
        }
    } catch (error) {
        console.error('Error loading streams:', error);
        showMessage('Error loading streams', true);
    }
}

// Load meetings
async function loadMeetings() {
    try {
        const response = await apiCall('/livestream/meetings');
        if (response.success) {
            meetings = response.data;
            renderMeetings();
        }
    } catch (error) {
        console.error('Error loading meetings:', error);
        showMessage('Error loading meetings', true);
    }
}

// Create stream
async function createStream(event) {
    event.preventDefault();
    
    const title = document.getElementById('stream-title').value;
    const description = document.getElementById('stream-description').value;
    const scheduled_time = document.getElementById('stream-scheduled-time').value;
    const duration = document.getElementById('stream-duration').value;
    
    try {
        const response = await apiCall('/livestream/create-stream', 'POST', {
            title,
            description,
            scheduled_time,
            duration,
            created_by: currentUser ? currentUser.id : 1
        });
        
        if (response.success) {
            showMessage('Stream created successfully!', false);
            closeModal('create-stream-modal');
            document.getElementById('create-stream-form').reset();
            loadStreams();
        } else {
            showMessage(response.error || 'Failed to create stream', true);
        }
    } catch (error) {
        console.error('Error creating stream:', error);
        showMessage('Error creating stream', true);
    }
}

// Create meeting
async function createMeeting(event) {
    event.preventDefault();
    
    const title = document.getElementById('meeting-title').value;
    const description = document.getElementById('meeting-description').value;
    const scheduled_time = document.getElementById('meeting-scheduled-time').value;
    const duration = document.getElementById('meeting-duration').value;
    const max_participants = document.getElementById('meeting-max-participants').value;
    
    try {
        const response = await apiCall('/livestream/create-meeting', 'POST', {
            title,
            description,
            scheduled_time,
            duration,
            max_participants,
            created_by: currentUser ? currentUser.id : 1
        });
        
        if (response.success) {
            showMessage('Meeting created successfully!', false);
            closeModal('create-meeting-modal');
            document.getElementById('create-meeting-form').reset();
            loadMeetings();
        } else {
            showMessage(response.error || 'Failed to create meeting', true);
        }
    } catch (error) {
        console.error('Error creating meeting:', error);
        showMessage('Error creating meeting', true);
    }
}

// Render streams
function renderStreams() {
    const streamsList = document.getElementById('streams-list');
    
    if (streams.length === 0) {
        streamsList.innerHTML = '<div class="no-data">No streams available</div>';
        return;
    }
    
    streamsList.innerHTML = streams.map(stream => `
        <div class="stream-card">
            <div class="stream-header">
                <h3>${stream.title}</h3>
                <span class="stream-status ${stream.status}">${stream.status.toUpperCase()}</span>
            </div>
            <div class="stream-body">
                <p>${stream.description || 'No description available'}</p>
                <div class="stream-details">
                    <span><i class="fas fa-user"></i> ${stream.created_by_name || 'Unknown'}</span>
                    <span><i class="fas fa-clock"></i> ${stream.duration} minutes</span>
                    <span><i class="fas fa-users"></i> ${stream.participants || 0} participants</span>
                </div>
                <div class="stream-actions">
                    ${stream.status === 'scheduled' ? `
                        <button class="btn btn-success" onclick="startStream('${stream.id}')">
                            <i class="fas fa-play"></i> Start
                        </button>
                    ` : ''}
                    ${stream.status === 'live' ? `
                        <button class="btn btn-primary" onclick="showJoinStreamModal('${stream.id}')">
                            <i class="fas fa-video"></i> Join
                        </button>
                        <button class="btn btn-warning" onclick="endStream('${stream.id}')">
                            <i class="fas fa-stop"></i> End
                        </button>
                    ` : ''}
                    <button class="btn btn-info" onclick="copyStreamLink('${stream.stream_link}')">
                        <i class="fas fa-link"></i> Copy Link
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Render meetings
function renderMeetings() {
    const meetingsList = document.getElementById('meetings-list');
    
    if (meetings.length === 0) {
        meetingsList.innerHTML = '<div class="no-data">No meetings available</div>';
        return;
    }
    
    meetingsList.innerHTML = meetings.map(meeting => `
        <div class="meeting-card">
            <div class="meeting-header">
                <h3>${meeting.title}</h3>
                <span class="meeting-status ${meeting.status}">${meeting.status.toUpperCase()}</span>
            </div>
            <div class="meeting-body">
                <p>${meeting.description || 'No description available'}</p>
                <div class="meeting-details">
                    <span><i class="fas fa-user"></i> ${meeting.created_by_name || 'Unknown'}</span>
                    <span><i class="fas fa-clock"></i> ${meeting.duration} minutes</span>
                    <span><i class="fas fa-users"></i> ${meeting.participants || 0}/${meeting.max_participants}</span>
                </div>
                <div class="meeting-actions">
                    ${meeting.status === 'scheduled' ? `
                        <button class="btn btn-success" onclick="startMeeting('${meeting.id}')">
                            <i class="fas fa-play"></i> Start
                        </button>
                    ` : ''}
                    ${meeting.status === 'live' ? `
                        <button class="btn btn-primary" onclick="showJoinMeetingModal('${meeting.id}')">
                            <i class="fas fa-sign-in-alt"></i> Join
                        </button>
                        <button class="btn btn-warning" onclick="endMeeting('${meeting.id}')">
                            <i class="fas fa-stop"></i> End
                        </button>
                    ` : ''}
                    <button class="btn btn-info" onclick="copyMeetingLink('${meeting.meeting_link}')">
                        <i class="fas fa-link"></i> Copy Link
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Start stream
async function startStream(streamId) {
    try {
        const response = await apiCall(`/livestream/start-stream/${streamId}`, 'POST');
        if (response.success) {
            showMessage('Stream started successfully!', false);
            loadStreams();
        } else {
            showMessage(response.error || 'Failed to start stream', true);
        }
    } catch (error) {
        console.error('Error starting stream:', error);
        showMessage('Error starting stream', true);
    }
}

// Start meeting
async function startMeeting(meetingId) {
    try {
        const response = await apiCall(`/livestream/start-meeting/${meetingId}`, 'POST');
        if (response.success) {
            showMessage('Meeting started successfully!', false);
            loadMeetings();
        } else {
            showMessage(response.error || 'Failed to start meeting', true);
        }
    } catch (error) {
        console.error('Error starting meeting:', error);
        showMessage('Error starting meeting', true);
    }
}

// End stream
async function endStream(streamId) {
    if (confirm('Are you sure you want to end this stream?')) {
        try {
            const response = await apiCall(`/livestream/end-stream/${streamId}`, 'POST');
            if (response.success) {
                showMessage('Stream ended successfully!', false);
                loadStreams();
            } else {
                showMessage(response.error || 'Failed to end stream', true);
            }
        } catch (error) {
            console.error('Error ending stream:', error);
            showMessage('Error ending stream', true);
        }
    }
}

// End meeting
async function endMeeting(meetingId) {
    if (confirm('Are you sure you want to end this meeting?')) {
        try {
            const response = await apiCall(`/livestream/end-meeting/${meetingId}`, 'POST');
            if (response.success) {
                showMessage('Meeting ended successfully!', false);
                loadMeetings();
            } else {
                showMessage(response.error || 'Failed to end meeting', true);
            }
        } catch (error) {
            console.error('Error ending meeting:', error);
            showMessage('Error ending meeting', true);
        }
    }
}

// Show join stream modal
function showJoinStreamModal(streamId) {
    const stream = streams.find(s => s.id === streamId);
    if (stream) {
        currentStream = stream;
        document.getElementById('join-stream-title').textContent = stream.title;
        document.getElementById('join-stream-description').textContent = stream.description || 'No description available';
        document.getElementById('join-stream-duration').textContent = stream.duration;
        document.getElementById('join-stream-host').textContent = stream.created_by_name || 'Unknown';
        document.getElementById('join-stream-modal').style.display = 'flex';
    }
}

// Show join meeting modal
function showJoinMeetingModal(meetingId) {
    const meeting = meetings.find(m => m.id === meetingId);
    if (meeting) {
        currentMeeting = meeting;
        document.getElementById('join-meeting-title').textContent = meeting.title;
        document.getElementById('join-meeting-description').textContent = meeting.description || 'No description available';
        document.getElementById('join-meeting-duration').textContent = meeting.duration;
        document.getElementById('join-meeting-host').textContent = meeting.created_by_name || 'Unknown';
        document.getElementById('join-meeting-participants').textContent = meeting.participants || 0;
        document.getElementById('join-meeting-max').textContent = meeting.max_participants;
        document.getElementById('join-meeting-modal').style.display = 'flex';
    }
}

// Join stream
function joinStream() {
    if (currentStream) {
        window.open(currentStream.stream_link, '_blank');
        closeModal('join-stream-modal');
    }
}

// Join meeting
function joinMeeting() {
    if (currentMeeting) {
        window.open(currentMeeting.meeting_link, '_blank');
        closeModal('join-meeting-modal');
    }
}

// Copy stream link
function copyStreamLink(link) {
    navigator.clipboard.writeText(link).then(() => {
        showMessage('Stream link copied to clipboard!', false);
    }).catch(() => {
        showMessage('Failed to copy link', true);
    });
}

// Copy meeting link
function copyMeetingLink(link) {
    navigator.clipboard.writeText(link).then(() => {
        showMessage('Meeting link copied to clipboard!', false);
    }).catch(() => {
        showMessage('Failed to copy link', true);
    });
}

// Show create stream modal
function showCreateStreamModal() {
    document.getElementById('create-stream-modal').style.display = 'flex';
}

// Show create meeting modal
function showCreateMeetingModal() {
    document.getElementById('create-meeting-modal').style.display = 'flex';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Search streams
function searchStreams() {
    const searchTerm = document.getElementById('stream-search').value.toLowerCase();
    const filteredStreams = streams.filter(stream => 
        stream.title.toLowerCase().includes(searchTerm) || 
        (stream.description && stream.description.toLowerCase().includes(searchTerm))
    );
    renderFilteredStreams(filteredStreams);
}

// Search meetings
function searchMeetings() {
    const searchTerm = document.getElementById('meeting-search').value.toLowerCase();
    const filteredMeetings = meetings.filter(meeting => 
        meeting.title.toLowerCase().includes(searchTerm) || 
        (meeting.description && meeting.description.toLowerCase().includes(searchTerm))
    );
    renderFilteredMeetings(filteredMeetings);
}

// Filter streams
function filterStreams() {
    const filterValue = document.getElementById('stream-filter').value;
    const filteredStreams = streams.filter(stream => {
        if (filterValue === 'all') return true;
        return stream.status === filterValue;
    });
    renderFilteredStreams(filteredStreams);
}

// Filter meetings
function filterMeetings() {
    const filterValue = document.getElementById('meeting-filter').value;
    const filteredMeetings = meetings.filter(meeting => {
        if (filterValue === 'all') return true;
        return meeting.status === filterValue;
    });
    renderFilteredMeetings(filteredMeetings);
}

// Render filtered streams
function renderFilteredStreams(filteredStreams) {
    const streamsList = document.getElementById('streams-list');
    
    if (filteredStreams.length === 0) {
        streamsList.innerHTML = '<div class="no-data">No streams found</div>';
        return;
    }
    
    const originalStreams = streams;
    streams = filteredStreams;
    renderStreams();
    streams = originalStreams;
}

// Render filtered meetings
function renderFilteredMeetings(filteredMeetings) {
    const meetingsList = document.getElementById('meetings-list');
    
    if (filteredMeetings.length === 0) {
        meetingsList.innerHTML = '<div class="no-data">No meetings found</div>';
        return;
    }
    
    const originalMeetings = meetings;
    meetings = filteredMeetings;
    renderMeetings();
    meetings = originalMeetings;
}
