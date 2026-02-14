<?php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Database connection
$host = 'localhost';
$dbname = 'railway';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));

// Portfolio authentication endpoints
if ($path_parts[0] === 'api' && isset($path_parts[1]) && $path_parts[1] === 'portfolio-auth') {
    
    if ($method === 'POST' && isset($path_parts[2]) && $path_parts[2] === 'register') {
        // Portfolio registration
        handlePortfolioRegister($pdo);
    } elseif ($method === 'POST' && isset($path_parts[2]) && $path_parts[2] === 'login') {
        // Portfolio login
        handlePortfolioLogin($pdo);
    } elseif ($method === 'POST' && isset($path_parts[2]) && $path_parts[2] === 'logout') {
        // Portfolio logout
        handlePortfolioLogout($pdo);
    } else {
        echo json_encode(['error' => 'Invalid portfolio auth endpoint']);
    }
    exit();
}

// Portfolio data endpoints
if ($path_parts[0] === 'api' && isset($path_parts[1]) && $path_parts[1] === 'portfolio') {
    
    // Check if user is authenticated (simplified - in production, use proper JWT/session)
    $user_id = null;
    if (isset($_SESSION['portfolio_user_id'])) {
        $user_id = $_SESSION['portfolio_user_id'];
    }
    
    if (!$user_id && $method !== 'GET') {
        echo json_encode(['error' => 'Authentication required']);
        exit();
    }
    
    if ($method === 'GET' && isset($path_parts[2]) && $path_parts[2] === 'profile') {
        // Get portfolio profile
        handleGetPortfolioProfile($pdo, $user_id);
    } elseif ($method === 'PUT' && isset($path_parts[2]) && $path_parts[2] === 'profile') {
        // Update portfolio profile
        handleUpdatePortfolioProfile($pdo, $user_id);
    } elseif ($method === 'GET' && isset($path_parts[2]) && $path_parts[2] === 'skills') {
        // Get portfolio skills
        handleGetPortfolioSkills($pdo, $user_id);
    } elseif ($method === 'POST' && isset($path_parts[2]) && $path_parts[2] === 'skills') {
        // Add portfolio skill
        handleAddPortfolioSkill($pdo, $user_id);
    } elseif ($method === 'DELETE' && isset($path_parts[2]) && $path_parts[2] === 'skills' && isset($path_parts[3])) {
        // Delete portfolio skill
        handleDeletePortfolioSkill($pdo, $user_id, $path_parts[3]);
    } elseif ($method === 'GET' && isset($path_parts[2]) && $path_parts[2] === 'experience') {
        // Get portfolio experience
        handleGetPortfolioExperience($pdo, $user_id);
    } elseif ($method === 'POST' && isset($path_parts[2]) && $path_parts[2] === 'experience') {
        // Add portfolio experience
        handleAddPortfolioExperience($pdo, $user_id);
    } elseif ($method === 'DELETE' && isset($path_parts[2]) && $path_parts[2] === 'experience' && isset($path_parts[3])) {
        // Delete portfolio experience
        handleDeletePortfolioExperience($pdo, $user_id, $path_parts[3]);
    } elseif ($method === 'GET' && isset($path_parts[2]) && $path_parts[2] === 'projects') {
        // Get portfolio projects
        handleGetPortfolioProjects($pdo, $user_id);
    } elseif ($method === 'POST' && isset($path_parts[2]) && $path_parts[2] === 'projects') {
        // Add portfolio project
        handleAddPortfolioProject($pdo, $user_id);
    } elseif ($method === 'DELETE' && isset($path_parts[2]) && $path_parts[2] === 'projects' && isset($path_parts[3])) {
        // Delete portfolio project
        handleDeletePortfolioProject($pdo, $user_id, $path_parts[3]);
    } else {
        echo json_encode(['error' => 'Invalid portfolio endpoint']);
    }
    exit();
}

// Portfolio Registration Handler
function handlePortfolioRegister($pdo) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['name']) || !isset($data['email']) || !isset($data['username']) || !isset($data['password'])) {
            echo json_encode(['error' => 'All fields are required']);
            return;
        }
        
        if ($data['password'] !== $data['confirm_password']) {
            echo json_encode(['error' => 'Passwords do not match']);
            return;
        }
        
        // Check if email or username already exists
        $stmt = $pdo->prepare("SELECT id FROM portfolio_users WHERE email = ? OR username = ?");
        $stmt->execute([$data['email'], $data['username']]);
        
        if ($stmt->fetch()) {
            echo json_encode(['error' => 'Email or username already exists']);
            return;
        }
        
        // Hash password
        $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // Insert new portfolio user
        $stmt = $pdo->prepare("INSERT INTO portfolio_users (name, email, username, password, user_type) VALUES (?, ?, ?, ?, 'portfolio')");
        $stmt->execute([$data['name'], $data['email'], $data['username'], $hashed_password]);
        
        $user_id = $pdo->lastInsertId();
        
        // Get created user
        $stmt = $pdo->prepare("SELECT id, name, email, username, user_type, created_at FROM portfolio_users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Start session
        session_start();
        $_SESSION['portfolio_user_id'] = $user_id;
        $_SESSION['portfolio_user'] = $user;
        
        echo json_encode([
            'success' => true,
            'message' => 'Portfolio registration successful',
            'user' => $user
        ]);
        
    } catch (Exception $e) {
        echo json_encode(['error' => 'Registration failed: ' . $e->getMessage()]);
    }
}

// Portfolio Login Handler
function handlePortfolioLogin($pdo) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['username']) || !isset($data['password'])) {
            echo json_encode(['error' => 'Username and password are required']);
            return;
        }
        
        // Find user by username or email
        $stmt = $pdo->prepare("SELECT id, name, email, username, password, user_type, created_at FROM portfolio_users WHERE username = ? OR email = ?");
        $stmt->execute([$data['username'], $data['username']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user || !password_verify($data['password'], $user['password'])) {
            echo json_encode(['error' => 'Invalid username or password']);
            return;
        }
        
        // Remove password from response
        unset($user['password']);
        
        // Start session
        session_start();
        $_SESSION['portfolio_user_id'] = $user['id'];
        $_SESSION['portfolio_user'] = $user;
        
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => $user
        ]);
        
    } catch (Exception $e) {
        echo json_encode(['error' => 'Login failed: ' . $e->getMessage()]);
    }
}

// Portfolio Logout Handler
function handlePortfolioLogout($pdo) {
    session_start();
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logout successful']);
}

// Get Portfolio Profile
function handleGetPortfolioProfile($pdo, $user_id) {
    try {
        $stmt = $pdo->prepare("
            SELECT pp.* FROM portfolio_profile pp 
            WHERE pp.user_id = ?
        ");
        $stmt->execute([$user_id]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$profile) {
            // Create default profile
            $stmt = $pdo->prepare("INSERT INTO portfolio_profile (user_id) VALUES (?)");
            $stmt->execute([$user_id]);
            
            $stmt = $pdo->prepare("SELECT * FROM portfolio_profile WHERE user_id = ?");
            $stmt->execute([$user_id]);
            $profile = $stmt->fetch(PDO::FETCH_ASSOC);
        }
        
        echo json_encode($profile ?: []);
        
    } catch (Exception $e) {
        echo json_encode(['error' => 'Failed to fetch profile: ' . $e->getMessage()]);
    }
}

// Update Portfolio Profile
function handleUpdatePortfolioProfile($pdo, $user_id) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            UPDATE portfolio_profile 
            SET title = ?, bio = ?, phone = ?, location = ?, website = ?, category = ?
            WHERE user_id = ?
        ");
        $stmt->execute([
            $data['title'] ?? null,
            $data['bio'] ?? null,
            $data['phone'] ?? null,
            $data['location'] ?? null,
            $data['website'] ?? null,
            $data['category'] ?? null,
            $user_id
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
        
    } catch (Exception $e) {
        echo json_encode(['error' => 'Failed to update profile: ' . $e->getMessage()]);
    }
}

// Get Portfolio Skills
function handleGetPortfolioSkills($pdo, $user_id) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM portfolio_skills WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user_id]);
        $skills = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($skills);
        
    } catch (Exception $e) {
        echo json_encode(['error' => 'Failed to fetch skills: ' . $e->getMessage()]);
    }
}

// Add Portfolio Skill
function handleAddPortfolioSkill($pdo, $user_id) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            INSERT INTO portfolio_skills (user_id, name, level, category, description)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $user_id,
            $data['name'],
            $data['level'],
            $data['category'],
            $data['description'] ?? null
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Skill added successfully']);
        
    } catch (Exception $e) {
        echo json_encode(['error' => 'Failed to add skill: ' . $e->getMessage()]);
    }
}

// Delete Portfolio Skill
function handleDeletePortfolioSkill($pdo, $user_id, $skill_id) {
    try {
        $stmt = $pdo->prepare("DELETE FROM portfolio_skills WHERE id = ? AND user_id = ?");
        $stmt->execute([$skill_id, $user_id]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Skill deleted successfully']);
        } else {
            echo json_encode(['error' => 'Skill not found or access denied']);
        }
        
    } catch (Exception $e) {
        echo json_encode(['error' => 'Failed to delete skill: ' . $e->getMessage()]);
    }
}

// Get Portfolio Experience
function handleGetPortfolioExperience($pdo, $user_id) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM portfolio_experience WHERE user_id = ? ORDER BY start_date DESC");
        $stmt->execute([$user_id]);
        $experience = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($experience);
        
    } catch (Exception $e) {
        echo json_encode(['error' => 'Failed to fetch experience: ' . $e->getMessage()]);
    }
}

// Add Portfolio Experience
function handleAddPortfolioExperience($pdo, $user_id) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            INSERT INTO portfolio_experience (user_id, company, position, start_date, end_date, description)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $user_id,
            $data['company'],
            $data['position'],
            $data['start_date'],
            $data['end_date'] ?? null,
            $data['description']
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Experience added successfully']);
        
    } catch (Exception $e) {
        echo json_encode(['error' => 'Failed to add experience: ' . $e->getMessage()]);
    }
}

// Delete Portfolio Experience
function handleDeletePortfolioExperience($pdo, $user_id, $exp_id) {
    try {
        $stmt = $pdo->prepare("DELETE FROM portfolio_experience WHERE id = ? AND user_id = ?");
        $stmt->execute([$exp_id, $user_id]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Experience deleted successfully']);
        } else {
            echo json_encode(['error' => 'Experience not found or access denied']);
        }
        
    } catch (Exception $e) {
        echo json_encode(['error' => 'Failed to delete experience: ' . $e->getMessage()]);
    }
}

// Get Portfolio Projects
function handleGetPortfolioProjects($pdo, $user_id) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM portfolio_projects WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user_id]);
        $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($projects);
        
    } catch (Exception $e) {
        echo json_encode(['error' => 'Failed to fetch projects: ' . $e->getMessage()]);
    }
}

// Add Portfolio Project
function handleAddPortfolioProject($pdo, $user_id) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            INSERT INTO portfolio_projects (user_id, name, description, technologies, link, image)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $user_id,
            $data['name'],
            $data['description'],
            $data['technologies'] ?? null,
            $data['link'] ?? null,
            $data['image'] ?? null
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Project added successfully']);
        
    } catch (Exception $e) {
        echo json_encode(['error' => 'Failed to add project: ' . $e->getMessage()]);
    }
}

// Delete Portfolio Project
function handleDeletePortfolioProject($pdo, $user_id, $project_id) {
    try {
        $stmt = $pdo->prepare("DELETE FROM portfolio_projects WHERE id = ? AND user_id = ?");
        $stmt->execute([$project_id, $user_id]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Project deleted successfully']);
        } else {
            echo json_encode(['error' => 'Project not found or access denied']);
        }
        
    } catch (Exception $e) {
        echo json_encode(['error' => 'Failed to delete project: ' . $e->getMessage()]);
    }
}

// Default response for invalid endpoints
echo json_encode(['error' => 'Invalid endpoint']);
?>
