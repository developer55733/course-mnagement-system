const database = require('../config/database');

class Forum {
    // Get all categories
    static async getCategories() {
        try {
            const [rows] = await database.query(
                'SELECT * FROM forum_categories ORDER BY name'
            );
            return rows;
        } catch (error) {
            throw new Error('Error fetching forum categories: ' + error.message);
        }
    }

    // Get posts by category
    static async getPostsByCategory(categoryId, limit = 20, offset = 0) {
        try {
            const [rows] = await database.query(`
                SELECT fp.*, u.name as author_name, u.email as author_email,
                       fc.name as category_name, fc.color as category_color,
                       COUNT(fr.id) as reply_count
                FROM forum_posts fp
                LEFT JOIN users u ON fp.user_id = u.id
                LEFT JOIN forum_categories fc ON fp.category_id = fc.id
                LEFT JOIN forum_replies fr ON fp.id = fr.post_id
                WHERE fp.category_id = ?
                GROUP BY fp.id
                ORDER BY fp.is_pinned DESC, fp.updated_at DESC
                LIMIT ? OFFSET ?
            `, [categoryId, limit, offset]);
            return rows;
        } catch (error) {
            throw new Error('Error fetching forum posts: ' + error.message);
        }
    }

    // Get all posts (for admin)
    static async getAllPosts(limit = 20, offset = 0) {
        try {
            const [rows] = await database.query(`
                SELECT fp.*, u.name as author_name, u.email as author_email,
                       fc.name as category_name, fc.color as category_color,
                       COUNT(fr.id) as reply_count
                FROM forum_posts fp
                LEFT JOIN users u ON fp.user_id = u.id
                LEFT JOIN forum_categories fc ON fp.category_id = fc.id
                LEFT JOIN forum_replies fr ON fp.id = fr.post_id
                GROUP BY fp.id
                ORDER BY fp.is_pinned DESC, fp.updated_at DESC
                LIMIT ? OFFSET ?
            `, [limit, offset]);
            return rows;
        } catch (error) {
            throw new Error('Error fetching forum posts: ' + error.message);
        }
    }

    // Get single post with replies
    static async getPostById(postId) {
        try {
            // Get post details
            const [postRows] = await database.query(`
                SELECT fp.*, u.name as author_name, u.email as author_email,
                       fc.name as category_name, fc.color as category_color
                FROM forum_posts fp
                LEFT JOIN users u ON fp.user_id = u.id
                LEFT JOIN forum_categories fc ON fp.category_id = fc.id
                WHERE fp.id = ?
            `, [postId]);

            if (postRows.length === 0) {
                return null;
            }

            const post = postRows[0];

            // Get replies
            const [replyRows] = await database.query(`
                SELECT fr.*, u.name as author_name, u.email as author_email
                FROM forum_replies fr
                LEFT JOIN users u ON fr.user_id = u.id
                WHERE fr.post_id = ?
                ORDER BY fr.created_at ASC
            `, [postId]);

            post.replies = replyRows;

            // Increment view count
            await database.query(
                'UPDATE forum_posts SET views = views + 1 WHERE id = ?',
                [postId]
            );

            return post;
        } catch (error) {
            throw new Error('Error fetching forum post: ' + error.message);
        }
    }

    // Create new post
    static async createPost(postData) {
        try {
            const { categoryId, userId, title, content, moduleCode, isPinned = false } = postData;
            
            const [result] = await database.query(`
                INSERT INTO forum_posts (category_id, user_id, title, content, module_code, is_pinned)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [categoryId, userId, title, content, moduleCode, isPinned]);

            return result.insertId;
        } catch (error) {
            throw new Error('Error creating forum post: ' + error.message);
        }
    }

    // Update post
    static async updatePost(postId, postData) {
        try {
            const { title, content, moduleCode, isPinned, isLocked } = postData;
            
            await database.query(`
                UPDATE forum_posts 
                SET title = ?, content = ?, module_code = ?, is_pinned = ?, is_locked = ?, updated_at = NOW()
                WHERE id = ?
            `, [title, content, moduleCode, isPinned, isLocked, postId]);

            return true;
        } catch (error) {
            throw new Error('Error updating forum post: ' + error.message);
        }
    }

    // Delete post
    static async deletePost(postId) {
        try {
            await database.query('DELETE FROM forum_posts WHERE id = ?', [postId]);
            return true;
        } catch (error) {
            throw new Error('Error deleting forum post: ' + error.message);
        }
    }

    // Add reply to post
    static async addReply(replyData) {
        try {
            const { postId, userId, content, parentReplyId = null } = replyData;
            
            const [result] = await database.query(`
                INSERT INTO forum_replies (post_id, user_id, content, parent_reply_id)
                VALUES (?, ?, ?, ?)
            `, [postId, userId, content, parentReplyId]);

            // Update post's updated_at timestamp
            await database.query(
                'UPDATE forum_posts SET updated_at = NOW() WHERE id = ?',
                [postId]
            );

            return result.insertId;
        } catch (error) {
            throw new Error('Error adding forum reply: ' + error.message);
        }
    }

    // Update reply
    static async updateReply(replyId, content) {
        try {
            await database.query(
                'UPDATE forum_replies SET content = ?, updated_at = NOW() WHERE id = ?',
                [content, replyId]
            );
            return true;
        } catch (error) {
            throw new Error('Error updating forum reply: ' + error.message);
        }
    }

    // Delete reply
    static async deleteReply(replyId) {
        try {
            await database.query('DELETE FROM forum_replies WHERE id = ?', [replyId]);
            return true;
        } catch (error) {
            throw new Error('Error deleting forum reply: ' + error.message);
        }
    }

    // Search posts
    static async searchPosts(query, limit = 20, offset = 0) {
        try {
            const [rows] = await database.query(`
                SELECT fp.*, u.name as author_name, u.email as author_email,
                       fc.name as category_name, fc.color as category_color,
                       COUNT(fr.id) as reply_count
                FROM forum_posts fp
                LEFT JOIN users u ON fp.user_id = u.id
                LEFT JOIN forum_categories fc ON fp.category_id = fc.id
                LEFT JOIN forum_replies fr ON fp.id = fr.post_id
                WHERE fp.title LIKE ? OR fp.content LIKE ?
                GROUP BY fp.id
                ORDER BY fp.updated_at DESC
                LIMIT ? OFFSET ?
            `, [`%${query}%`, `%${query}%`, limit, offset]);
            return rows;
        } catch (error) {
            throw new Error('Error searching forum posts: ' + error.message);
        }
    }

    // Get posts by user
    static async getPostsByUser(userId, limit = 20, offset = 0) {
        try {
            const [rows] = await database.query(`
                SELECT fp.*, u.name as author_name, u.email as author_email,
                       fc.name as category_name, fc.color as category_color,
                       COUNT(fr.id) as reply_count
                FROM forum_posts fp
                LEFT JOIN users u ON fp.user_id = u.id
                LEFT JOIN forum_categories fc ON fp.category_id = fc.id
                LEFT JOIN forum_replies fr ON fp.id = fr.post_id
                WHERE fp.user_id = ?
                GROUP BY fp.id
                ORDER BY fp.updated_at DESC
                LIMIT ? OFFSET ?
            `, [userId, limit, offset]);
            return rows;
        } catch (error) {
            throw new Error('Error fetching user posts: ' + error.message);
        }
    }

    // Get forum statistics
    static async getForumStats() {
        try {
            const [stats] = await database.query(`
                SELECT 
                    COUNT(DISTINCT fp.id) as total_posts,
                    COUNT(DISTINCT fr.id) as total_replies,
                    COUNT(DISTINCT fp.user_id) as active_users,
                    COUNT(DISTINCT fp.category_id) as active_categories
                FROM forum_posts fp
                LEFT JOIN forum_replies fr ON fp.id = fr.post_id
            `);
            return stats[0];
        } catch (error) {
            throw new Error('Error fetching forum statistics: ' + error.message);
        }
    }
}

module.exports = Forum;
