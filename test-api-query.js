const express = require('express');
const { query } = require('./config/database');

async function testAPI() {
  try {
    console.log('Testing API endpoint...');
    
    // Simulate the exact API query
    const sql = `
      SELECT n.*, u.name as created_by_name 
      FROM notes n 
      LEFT JOIN users u ON n.created_by = u.id 
      WHERE n.visibility = 'public'
      ORDER BY n.created_at DESC
    `;
    
    console.log('🔍 Executing SQL:', sql);
    const [notes] = await query(sql);
    console.log('🔍 Query result:', notes.length, 'notes found');
    console.log('🔍 Sample note:', notes[0]);
    
    // Check if users table exists and has data
    const [usersCheck] = await query('SELECT COUNT(*) as count FROM users');
    console.log('🔍 Users count:', usersCheck[0].count);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ API test error:', error);
    process.exit(1);
  }
}

testAPI();
