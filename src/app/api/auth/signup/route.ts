import { NextRequest, NextResponse } from 'next/server';
import api from '../../../../../lib/axios';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 SIGNUP API: Processing signup request');
    
    const body = await request.json();
    console.log('📝 SIGNUP API: Received data:', body);
    
    // Call backend API to create user account
    const response = await api.post('/auth/signup', body);
    
    console.log('📝 SIGNUP API: Backend response:', response.data);
    
    // Check if backend signup was successful
    if (!response.data.success) {
      console.log('📝 SIGNUP API: Backend returned failure - propagating error');
      return NextResponse.json({
        success: false,
        message: response.data.message || 'Signup failed',
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email for verification.',
      data: response.data,
    });

  } catch (error: any) {
    console.error('📝 SIGNUP API: Error:', error);
    
    // Handle different error types
    if (error.response?.data) {
      // Backend returned an error
      const status = error.response.status;
      const errorData = error.response.data;
      console.log('📝 SIGNUP API: Backend error data:', errorData);
      
      // Try to extract message from different possible structures
      let message = 'Signup failed';
      if (errorData.message) {
        // Handle if message is an array
        if (Array.isArray(errorData.message)) {
          message = errorData.message.join(', ');
        } else {
          message = errorData.message;
        }
        // Add more context for common errors
        if (errorData.errorCode === 'INTERNAL_SERVER_ERROR') {
          message += ' (Server error - please try again later)';
          // Check if it might be duplicate email
          if (message.toLowerCase().includes('duplicate') || message.toLowerCase().includes('exists')) {
            message = 'Email already registered. Please use a different email or try logging in.';
          }
        } else if (errorData.status === false && errorData.errorCode) {
          message += ` (${errorData.errorCode})`;
        }
      } else if (errorData.error) {
        message = errorData.error;
      } else if (errorData.errors && Array.isArray(errorData.errors)) {
        message = errorData.errors.join(', ');
      }
      
      // Log the full error for debugging
      console.log('📝 SIGNUP API: Final error message:', message);
      
      return NextResponse.json(
        { 
          success: false, 
          message: message,
          error: errorData
        },
        { status: 200 } // Don't send status code to avoid fetch throwing error
      );
    }
    
    // Network or other errors
    return NextResponse.json({
      success: false, 
      message: 'Network error. Please try again.',
      error: error.message
    });
  }
}
